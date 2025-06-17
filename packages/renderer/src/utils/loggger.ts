import log from 'electron-log/renderer';

log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';

//替换console.log
Object.assign(console, log.functions);

export {log};
