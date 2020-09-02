
# 前端日志系统 logsystem

描述：前端日志上传系统，
     数据缓存使用indexDB，
     发布使用XHR（XMLHttpRequest），
     采用操作循环队列————依次存/取DB操作
     可选择webworker进行日志相关的操作。目的是减少对主程序的影响。

文件说明： 
      log_db.ts   数据库管理系统, 数据库连接、存取、删除等操作
      log_manager.ts 日志管理核心，链接log_reporter,log_db,operation_queue。接收注册的日志，对日志进行存取、删除操作。 日志的每日提交会在此完成。
      operation_queue.ts  对数据库的循环操作队列 
      log_register.ts 日志配置的初始化、每条日志会再此注册并存到数据库
      log_configer.ts  存取日志配置信息，包括日志元数据、日志封装方式，XHR请求重复次数、请求url、header等信息，是否使用webworker方案
      log_report.ts  日志上传系统。
      webworker.ts   采用webworker处理log_manager内部操作
     


