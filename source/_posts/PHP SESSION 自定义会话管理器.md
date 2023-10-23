---
title: PHP SESSION 自定义会话管理器
tags:
    - PHP
    - SESSION
date: 2017-02-13 18:38:45
categories:
    - PHP
---
## 前言

在遇到了 `SESSION` 混乱的问题后，突然对自定义会话管理器有了兴趣，于是便研究实现了一番。

## 分析

根据[PHP官网](http://php.net)的说明，实现方式有两种，这里准备用继承类的方式做，同时将 `SESSION` 存储于 `Memcache` 中。

## 实现

首先先要写一个继承于 `SessionHandlerInterface` 的类。

```php
class MemcachedHanlder implements SessionHandlerInterface
{
}
```

在 `MemcachedHanlder` 类实例化的时候，附上需要连接 `Memcached` 的参数。

```php
protected $_options;
protected $_memcached;
protected $_prefix;

function __construct(array $options = [])
{
    if (!isset($options['host'])) {
        $options['host'] = '127.0.0.1';
    }
    if (!isset($options['port'])) {
        $options['port'] = 11211;
    }
    if (!isset($options['persistent'])) {
        $options['persistent'] = false;
    }
    if (!isset($options['lifetime'])) {
        $options['lifetime'] = null;
    }
    $this->_prefix = isset($options['prefix']) ? $options['prefix'] : '';
    $this->_options = $options;
}
```

继承 `SessionHandlerInterface` 的类需要实现几个方法：`open`、`close`、`read`、`write`、`destory` 和 `gc`。

在 `open` 中连接 `Memcached`。

```php
/**
 * Create new session, or re-initialize existing session
 * 
 * @param  string $path
 * @param  string $name
 * @return boolean
 */
public function open($path, $name)
{
    $options = $this->_options;
    if ($options) {
        $this->_memcached = new \Memcached($options);
        $this->_memcached->addServer($options['host'], $options['port'], $options['persistent']);
        return true;
    }
    return false;
}

/**
 * Closes the current session
 * 
 * @return integer
 */
public function close()
{
    return true;
}

/**
 * Read session data
 * 
 * @param  string $id
 * @return string
 */
public function read($id)
{
    return $this->_memcached->get($this->_prefix . $id, $this->_lifetime);
}

/**
 * Read session data
 * 
 * @param  string $id
 * @param  string $data
 * @return boolean
 */
public function write($id, $data)
{
    return $this->_memcached->set($this->_prefix . $id, $data, $this->_lifetime);
}

/**
 * Destroys a session
 * 
 * @param  string $id
 * @return boolean
 */
public function destroy($id)
{
    if (!$id && $this->_memcached->exists($this->_prefix . $id)) {
        return $this->_memcached->delete($this->_prefix . $id);
    }
    return true;
}

/**
 * Cleans up expired sessions
 * 
 * @param  string $value
 * @return boolean
 */
public function gc($maxlifetime)
{
    return true;
}
```

`Handler` 类写完之后，实例化它，并调用 `session_set_save_handler` 完成注册。

```php
$options = [];
$handler = new MemcachedHanlder($options);
session_set_save_handler($handler, true);
```

这时候，开始畅享 `SESSION` 吧。

## 完整代码

```php
class MemcachedHanlder implements SessionHandlerInterface
{
    protected $_options;
    protected $_memcached;
    protected $_prefix;

    function __construct(array $options = [])
    {
        if (!isset($options['host'])) {
            $options['host'] = '127.0.0.1';
        }
        if (!isset($options['port'])) {
            $options['port'] = 11211;
        }
        if (!isset($options['persistent'])) {
            $options['persistent'] = false;
        }
        if (!isset($options['lifetime'])) {
            $options['lifetime'] = null;
        }
        $this->_prefix = isset($options['prefix']) ? $options['prefix'] : '';
        $this->_options = $options;
    }

    /**
     * Create new session, or re-initialize existing session
     * 
     * @param  string $path
     * @param  string $name
     * @return boolean
     */
    public function open($path, $name)
    {
        $options = $this->_options;
        if ($options) {
            $this->_memcached = new \Memcached($options);
            $this->_memcached->addServer($options['host'], $options['port'], $options['persistent']);
            return true;
        }
        return false;
    }

    /**
     * Closes the current session
     * 
     * @return integer
     */
    public function close()
    {
        return true;
    }

    /**
     * Read session data
     * 
     * @param  string $id
     * @return string
     */
    public function read($id)
    {
        return $this->_memcached->get($this->_prefix . $id, $this->_lifetime);
    }

    /**
     * Read session data
     * 
     * @param  string $id
     * @param  string $data
     * @return boolean
     */
    public function write($id, $data)
    {
        return $this->_memcached->set($this->_prefix . $id, $data, $this->_lifetime);
    }

    /**
     * Destroys a session
     * 
     * @param  string $id
     * @return boolean
     */
    public function destroy($id)
    {
        if (!$id && $this->_memcached->exists($this->_prefix . $id)) {
            return $this->_memcached->delete($this->_prefix . $id);
        }
        return true;
    }

    /**
     * Cleans up expired sessions
     * 
     * @param  string $value
     * @return boolean
     */
    public function gc($maxlifetime)
    {
        return true;
    }
}
$options = [];
$handler = new MemcachedHanlder($options);
session_set_save_handler($handler, true);
```

## 总结

记得之前面试的时候，有人问过我 `SESSION` 与 `COOKIE` 之间的关系，`SESSION` 是怎么实现的，`SESSION` 除了存文件之外，还能够存在哪里，如何实现。

当初的我都没有回答上，想象当初真的是太年轻了，也很天真。越接触，越发现自己的渺小，越要勇往直前。