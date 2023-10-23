---
title: GuzzleHttp Exception cURL error 60 SSL certificate problem
tags:
    - PHP
    - CURL
    - SSL
date: 2020-10-20 18:38:45
categories:
    - PHP
---
### 前言
有一位同事在做本地开发的时候遇到了如下报错：

```
GuzzleHttp Exception cURL error 60: SSL certificate problem: unable to get local
```

开发环境：

- PHP7.2.1
- Win7
- phpstudy

终是在上网找到了解决方案，但不知其所以然。

### 问题所在

`GuzzleHttp` 在初始化配置时，默认 `verify = true`。

```php
// FILE: guzzlehttp/guzzle/src/Client.php
/**
 * Configures the default options for a client.
 *
 * @param array $config
 * @return void
 */
private function configureDefaults(array $config)
{
    /**
     * 这里的 verify 默认设置的是 true
     */
    $defaults = [
        'allow_redirects' => RedirectMiddleware::$defaultSettings,
        'http_errors'     => true,
        'decode_content'  => true,
        'verify'          => true,
        'cookies'         => false,
        'idn_conversion'  => true,
    ];
    ...
}
```

在后续 `curl` 的配置中，根据 `verify` 初始化了 `CURLOPT_SSL_VERIFYHOST`、`CURLOPT_SSL_VERIFYPEER` 两个变量。

```php
// FILE: guzzlehttp/guzzle/src/Handler/CurlFactory.php
private function applyHandlerOptions(EasyHandle $easy, array &$conf)
{
    $options = $easy->options;
    if (isset($options['verify'])) {
        if ($options['verify'] === false) {
            unset($conf[CURLOPT_CAINFO]);
            $conf[CURLOPT_SSL_VERIFYHOST] = 0;
            $conf[CURLOPT_SSL_VERIFYPEER] = false;
        } else {
            $conf[CURLOPT_SSL_VERIFYHOST] = 2;
            $conf[CURLOPT_SSL_VERIFYPEER] = true;
            if (is_string($options['verify'])) {
                // Throw an error if the file/folder/link path is not valid or doesn't exist.
                if (!file_exists($options['verify'])) {
                    throw new \InvalidArgumentException(
                        "SSL CA bundle not found: {$options['verify']}"
                    );
                }
                // If it's a directory or a link to a directory use CURLOPT_CAPATH.
                // If not, it's probably a file, or a link to a file, so use CURLOPT_CAINFO.
                if (is_dir($options['verify']) ||
                    (is_link($options['verify']) && is_dir(readlink($options['verify'])))) {
                    $conf[CURLOPT_CAPATH] = $options['verify'];
                } else {
                    $conf[CURLOPT_CAINFO] = $options['verify'];
                }
            }
        }
    }
    ...
}
```

由于 `CURLOPT_SSL_VERIFYPEER = true` 且 `CURLOPT_SSL_VERIFYHOST > 0`，那就需要 `验证SSL证书`。

*下面一段解释内容来源于：[传送门](https://guzzle-cn.readthedocs.io/zh_CN/latest/request-options.html#verify)*

并非所有的系统磁盘上都存在 `CA包`，比如，`Windows` 和 `OS X` 并没有通用的本地 `CA包`。 当设置 `verify` 为 `true` 时，`Guzzle` 将尽力在你的操作系统中找到合适的 `CA包`， 当使用 `cURL` 或 `PHP 5.6` 以上版本的流时，`Guzzle` 将按以下顺序尝试查找CA包：

- 检查php.ini文件中是否设置了 `openssl.cafile`。
- 检查php.ini文件中是否设置了 `curl.cainfo`。
- 检查 `/etc/pki/tls/certs/ca-bundle.crt` 是否存在 (`Red Hat`, `CentOS`, `Fedora`; 由 `ca-certificates` 包提供)
- 检查 `/etc/ssl/certs/ca-certificates.crt` 是否存在 (`Ubuntu`, `Debian`; 由 `ca-certificates` 包提供)
- 检查 `/usr/local/share/certs/ca-root-nss.crt` 是否存在 (`FreeBSD`; 由 `ca_root_nss` 包提供)
- 检查 `/usr/local/etc/openssl/cert.pem` 是否存在 (OS X; 由 `homebrew` 提供)
- 检查 `C:\windows\system32\curl-ca-bundle.crt` 是否存在 (`Windows`)
- 检查 `C:\windows\curl-ca-bundle.crt 是否存在` (`Windows`)

查询的结果将缓存在内存中，以便同一进程后续快速调用。 然而在有些服务器如 `Apache` 中每个请求都在独立的进程中，你应该考虑设置 `openssl.cafile` 环境变量，指定到磁盘文件，以便整个过程都跳过。

具体代码如下：

```php
/**
 * Returns the default cacert bundle for the current system.
 *
 * First, the openssl.cafile and curl.cainfo php.ini settings are checked.
 * If those settings are not configured, then the common locations for
 * bundles found on Red Hat, CentOS, Fedora, Ubuntu, Debian, FreeBSD, OS X
 * and Windows are checked. If any of these file locations are found on
 * disk, they will be utilized.
 *
 * Note: the result of this function is cached for subsequent calls.
 *
 * @return string
 * @throws \RuntimeException if no bundle can be found.
 */
function default_ca_bundle()
{
    static $cached = null;
    static $cafiles = [
        // Red Hat, CentOS, Fedora (provided by the ca-certificates package)
        '/etc/pki/tls/certs/ca-bundle.crt',
        // Ubuntu, Debian (provided by the ca-certificates package)
        '/etc/ssl/certs/ca-certificates.crt',
        // FreeBSD (provided by the ca_root_nss package)
        '/usr/local/share/certs/ca-root-nss.crt',
        // SLES 12 (provided by the ca-certificates package)
        '/var/lib/ca-certificates/ca-bundle.pem',
        // OS X provided by homebrew (using the default path)
        '/usr/local/etc/openssl/cert.pem',
        // Google app engine
        '/etc/ca-certificates.crt',
        // Windows?
        'C:\\windows\\system32\\curl-ca-bundle.crt',
        'C:\\windows\\curl-ca-bundle.crt',
    ];

    if ($cached) {
        return $cached;
    }

    if ($ca = ini_get('openssl.cafile')) {
        return $cached = $ca;
    }

    if ($ca = ini_get('curl.cainfo')) {
        return $cached = $ca;
    }

    foreach ($cafiles as $filename) {
        if (file_exists($filename)) {
            return $cached = $filename;
        }
    }

    throw new \RuntimeException(
        <<< EOT
No system CA bundle could be found in any of the the common system locations.
PHP versions earlier than 5.6 are not properly configured to use the system's
CA bundle by default. In order to verify peer certificates, you will need to
supply the path on disk to a certificate bundle to the 'verify' request
option: http://docs.guzzlephp.org/en/latest/clients.html#verify. If you do not
need a specific certificate bundle, then Mozilla provides a commonly used CA
bundle which can be downloaded here (provided by the maintainer of cURL):
https://raw.githubusercontent.com/bagder/ca-bundle/master/ca-bundle.crt. Once
you have a CA bundle available on disk, you can set the 'openssl.cafile' PHP
ini setting to point to the path to the file, allowing you to omit the 'verify'
request option. See http://curl.haxx.se/docs/sslcerts.html for more
information.
EOT
    );
}
```

### 结语

在没有需要检查证书需求的前提下，并且是直接引用的 `GuzzleHttp` 包，可以在初始化是，指定 `verify = false`。
反之，还是老老实实的将证书放在该放置的地方吧。