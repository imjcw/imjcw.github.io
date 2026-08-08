const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'source', '_posts');

// Permalink values (without leading/trailing /)
const PERMALINK_MAP = {
  '499问题查询解决': '2019/08/20/tools/499-error-solve',
  'CAS单点登录流程梳理': '2020/06/18/system/cas-sso-flow',
  'DECIAML字段字节计算': '2018/06/13/mysql/decimal-field-byte-calc',
  'wkhtmltopdf服务': '2021/02/22/docker/wkhtmltopdf-service',
  'ELKF日志学习(一)前言': '2020/12/17/elkf/elk-log-learn-1-intro',
  'ELKF日志学习(二)ELKF平台搭建 Docker单机': '2020/12/18/elkf/elk-log-learn-2-setup-docker-single',
  'ELKF日志学习(三)EKF平台搭建 Docker单机': '2020/12/19/elkf/elk-log-learn-3-setup-docker-single',
  'ELKF日志学习(四)FileBeat基础配置': '2020/12/20/elkf/elk-log-learn-4-filebeat-basic',
  'ELKF日志学习(五)FileBeat解析多行日志': '2020/12/21/elkf/elk-log-learn-5-filebeat-multiline',
  'ELKF日志学习(六)FileBeat过滤日志': '2020/12/22/elkf/elk-log-learn-6-filebeat-filter',
  'ELKF日志学习(七)Filebeat解析json': '2020/12/23/elkf/elk-log-learn-7-filebeat-json',
  'ELKF日志学习(八)Filebeat写入Elasticsearch': '2020/12/24/elkf/elk-log-learn-8-filebeat-elasticsearch',
  'ELKF日志学习(九)Logstash基础介绍': '2020/12/25/elkf/elk-log-learn-9-logstash-basic',
  'ELKF日志学习(十)Logstash解析日志成json': '2020/12/26/elkf/elk-log-learn-10-logstash-json',
  'ELKF日志学习(十一)Logstash实现钉钉告警': '2020/12/27/elkf/elk-log-learn-11-logstash-dingtalk-alert',
  'ELKF日志学习(十二)Kibana基础介绍': '2020/12/28/elkf/elk-log-learn-12-kibana-basic',
  'ELKF日志学习(十三)Kibana安装Sentinl插件': '2020/12/29/elkf/elk-log-learn-13-kibana-sentinl-plugin',
  'ELKF日志学习(十四)Kibana基于Sentinl实现钉钉告警': '2020/12/30/elkf/elk-log-learn-14-kibana-sentinl-dingtalk',
  'ES6中箭头函数和普通函数的区别': '2019/05/13/javascript/es6-arrow-vs-normal-function',
  'ES6对象的合并': '2019/06/13/javascript/es6-object-merge',
  'Git Tag相关': '2020/10/09/git/git-tag',
  'Git回滚': '2020/10/09/git/git-rollback',
  'Hyperf热更新': '2020/10/28/php/hyperf-hot-reload',
  'Element-ui获取上传的Excel并预览': '2021/03/10/javascript/element-ui-upload-excel-preview',
  'SheetJS生成_解析Excel': '2021/03/04/javascript/sheetjs-generate-parse-excel',
  'Laravel config注意点': '2020/11/02/laravel/laravel-config-notes',
  'Laravel使用Casts转换类型': '2020/11/16/php/laravel-casts-type',
  'Laravel日志分割': '2021/02/26/php/laravel-log-split',
  'Laravel记录SQL日志信息': '2020/11/09/php/laravel-sql-log',
  'Lumen生成PDF': '2020/11/04/php/lumen-generate-pdf',
  '基于Laravel的response中间件': '2020/11/03/laravel/laravel-response-middleware',
  'PDO 绑定IN()语句的Array变量': '2021/03/16/mysql/pdo-bind-in-array',
  'Phalcon只更新改变的字段': '2017/05/13/php/phalcon-update-changed-fields',
  'PHP限制脚本进程数量': '2021/03/03/php/php-limit-script-processes',
  'PHP SESSION 自定义会话管理器': '2020/12/03/javascript/php-session-custom-manager',
  'Promise原理分析': '2019/07/14/javascript/promise-principle',
  'Typora使用图床': '2020/10/26/tools/typora-image-bed',
  'Ubuntu安装phpize': '2018/05/13/linux/ubuntu-install-phpize',
  'v-charts的初次体验': '2019/08/13/javascript/v-charts-first-experience',
  'Vue-router 响应路由参数变化': '2020/12/03/javascript/vue-router-route-param-change',
  'win10安装docker踩过的坑': '2020/10/13/docker/win10-install-docker-pitfalls',
  '命令行Shadowsocks配置': '2019/02/13/shadowsocks/cli-shadowsocks-config',
  '字符串字符分割和驼峰形式的转换': '2017/02/13/javascript/string-split-camelcase',
  'Github镜像站': '2021/03/23/tool/github-mirror',
  '2026-08-08_大模型推理与缓存机制': '2026/08/08/AI/large-model-inference-caching',
};

function processFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const basename = path.basename(filePath, '.md');

  if (!PERMALINK_MAP[basename]) {
    console.log('SKIP:', basename);
    return;
  }

  if (/^permalink:\s/m.test(text)) {
    console.log('SKIP (has permalink):', basename);
    return;
  }

  const permalink = PERMALINK_MAP[basename];

  // Find line ending type
  const crlfIdx = text.indexOf('\r\n');
  const lfIdx = text.indexOf('\n');
  let sep, firstEnd;
  if (crlfIdx >= 0 && crlfIdx <= lfIdx) {
    sep = '\r\n';
    firstEnd = crlfIdx;
  } else {
    sep = '\n';
    firstEnd = lfIdx;
  }

  const firstLine = text.substring(0, firstEnd);
  const rest = text.substring(firstEnd + sep.length);

  if (firstLine !== '---') {
    console.log('WARN (no front matter):', basename);
    return;
  }

  const newContent = '---' + sep + 'permalink: ' + permalink + '/' + sep + rest;
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log('DONE:', basename, '->', permalink + '/');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith('.md') && /[\u4e00-\u9fff]/.test(path.basename(entry.name, '.md'))) {
      processFile(fullPath);
    }
  }
}

walk(POSTS_DIR);
console.log('\nDone.');
