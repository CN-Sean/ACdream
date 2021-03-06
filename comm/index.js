
var Settings = require('../settings');
var crypto = require('crypto');

/*
 * 返回评测结果描述
 */
exports.solRes = function(n) {
  switch (n) {
    case 0:
      return 'Pending...';
    case 1:
      return 'Running...';
    case 2:
      return 'Accepted';
    case 3:
      return 'Presentation Error';
    case 4:
      return 'Time Limit Exceeded';
    case 5:
      return 'Memory Limit Exceeded';
    case 6:
      return 'Wrong Answer';
    case 7:
      return 'Output Limit Exceeded';
    case 8:
      return 'Compilation Error';
    case 13:
      return 'Dangerous Code';
    case 14:
      return 'System Error';
    default:
      return 'Runtime Error';
  }
};

/*
 * 返回评测结果对应的CSS类(颜色)
 */
exports.solCol = function(n) {
  switch (n) {
    case 0:
    case 1:
      return 'info-text';
    case 2:
      return 'accept-text';
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 9:
    case 10:
    case 11:
    case 12:
    case 15:
      return 'wrong-text';
    default:
      return 'special-text';
  }
};

/*
 * 返回用户对应的CSS类(颜色)
 */
exports.userCol = function(n) {
  n = parseInt(n, 10);
  if (!n) return 'unrated';
  if (n >= 2200) {
    return 'red';
  } else if (n >= 1900) {
    return 'orange';
  } else if (n >= 1700) {
    return 'violet';
  } else if (n >= 1500) {
    return 'blue';
  } else if (n >= 1200) {
    return 'green';
  }
  return 'black';
};

/*
 * 返回用户描述
 */
exports.userTit = function(n) {
  n = parseInt(n, 10);
  if (!n) {
    return 'Unrated';
  } else if (n >= 2600) {
    return 'International Grandmaster';
  } else if (n >= 2200) {
    return 'Grandmaster';
  } else if (n >= 2050) {
    return 'International Master';
  } else if (n >= 1900) {
    return 'Master';
  } else if (n >= 1700) {
    return 'Candidate Master';
  } else if (n >= 1500) {
    return 'Expert';
  } else if (n >= 1350) {
    return 'Specialist';
  } else if (n >= 1200) {
    return 'Pupil';
  }
  return 'Newbie';
}

/*
 * 判断一个数是否为NAN
 */
exports.nan = function(n) {
  return n != n;
}

/*
 * 判断一个变量的类型是否string
 */
exports.isString = function(s) {
  return typeof(s) === 'string';
}

function nil(n) {
  return typeof(n) === 'undefined';
}

function trim(s) {
  if (nil(s)) return '';
  return String(s).replace(/(^\s*)|(\s*$)/g, '');
}

function drim(s) {
  if (nil(s)) return '';
  return String(s).replace(/(\s+)/g, ' ');
}

/*
 * 把头尾的空格全去掉，然后把连续的空格变成一个空格
 */
exports.clearSpace = function(s) {
  return drim(trim(s));
}

/*
 * 判断s是否为合法的username
 */
exports.isUsername = function(s) {
  return (new RegExp("^[a-zA-Z0-9_]{2,15}$")).test(s);
}

function checkEscape(ch) {
  if (ch == '$' || ch == '(' || ch == ')' || ch == '*' || ch == '+' ||
      ch == '.' || ch == '[' || ch == ']' || ch == '?' || ch == '\\' ||
      ch == '^' || ch == '^' || ch == '{' || ch == '}' || ch == '|')
    return true;
  return false;
}

/*
 * 把str的所有特殊字符转义
 */
exports.toEscape = function(str) {
  var res = '';
  for (var i = 0; i < str.length; i++) {
    if (checkEscape(str.charAt(i))) {
      res += '\\';
    }
    res += str.charAt(i);
  }
  return res;
}

/*
 * 把html代码转义
 */
exports.escapeHtml = function(s) {
  return s.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/*
 * 判断name是否在参赛列表中
 */
function isRegCon(contest, name) {
  return contest.contestants.indexOf(name) >= 0 ? true : false;
}
exports.isRegCon = isRegCon;

/*
 * 获取用户对于该比赛的注册状态
 */
exports.getRegState = function(contest, name) {
  if (name === 'admin' || isRegCon(contest, name)) {
    return 0;
  }
  var now = (new Date()).getTime();
  if (contest.password || now > contest.startTime + contest.len*60000 ||
      (!contest.open_reg && contest.startTime - now < Settings.reg_close_time)) {
    return 2;
  }
  return 1;
};

/*
 * 判断比赛是否已结束
 */
exports.isEnded = function(contest) {
  return (new Date()).getTime() - contest.startTime > contest.len*60000;
};

/*
 * 如果n<10，补前零
 */
var addZero = function(n) {
  n = parseInt(n, 10);
  if (n != n) {
    return '';
  }
  return (n < 10 ? '0' : '') + n;
};

exports.addZero = addZero;

/*
 * 传入毫秒数，返回时间描述(YYYY-MM-DD hh:mm:ss)
 */
var getDate = function(s) {
  var date = s ? new Date(s) : new Date();
  if (!date) {
    return '';
  }
  return date.getFullYear() + '-' + addZero(date.getMonth() + 1) + '-'+
    addZero(date.getDate()) + ' ' + addZero(date.getHours()) + ':' +
    addZero(date.getMinutes()) + ':' + addZero(date.getSeconds());
};

exports.getDate = getDate;

function gao(n, type) {
  if (n == 1) {
    if (type == 'hour')
      return 'an '+type+' ago';
    return 'a '+type+' ago';
  }
  return n+' '+type+'s ago';
}

/*
 * 根据n(毫秒数)返回大概时间描述
 */
exports.getAboutTime = function(n) {
  n = parseInt(n, 10);
  if (!n) return '';
  n = (new Date()).getTime() - n;
  var y = Math.floor(n/31104000000);
  if (y > 0) {
    return gao(y, 'year');
  }
  var m = Math.floor(n/2592000000);
  if (m > 0) {
    return gao(m, 'month');
  }
  var dd = Math.floor(n/86400000);
  if (dd > 0) {
    if (dd >= 7) {
      return gao(Math.floor(dd/7), 'week');
    }
    return gao(dd, 'day');
  }
  var hh = Math.floor(n/3600000);
  if (hh > 0) {
    return gao(hh, 'hour');
  }
  var mm = Math.floor(n/60000);
  if (mm > 0) {
    return gao(mm, 'minute')
  }
  return 'just now';
};

/*
 * 根据n(毫秒数)返回大概时间描述()
 */
exports.getTime = function(n) {
  n = parseInt(n, 10);
  if (!n) return '';
  var date = new Date(n);
  var RP = addZero(date.getMonth()+1)+'-'+addZero(date.getDate())+' '
    +addZero(date.getHours())+':'+addZero(date.getMinutes());
  var future = false;
  n = (new Date()).getTime() - n;
  if (n < 0) {
    future = true;
    n = -n;
  }
  var y = Math.floor(n/31536000000);
  if (y > 0) {
    return date.getFullYear()+'-'+RP;
  }
  var d = Math.floor(n/86400000);
  if (d > 0) {
    return RP;
  }
  var h = Math.floor(n/3600000);
  if (h > 0) {
    return h + '小时' + (future ? '后' : '前');
  }
  var m = Math.floor(n/60000);
  if (m > 0) {
    return m + '分钟' + (future ? '后' : '前');
  }
  return future ? '1分钟内' : '刚刚';
};

var fs = require('fs');
var log = fs.createWriteStream(Settings.root_path + 'error.log', {
  flags: 'a'
});

function getpos() {
  try {
    throw new Error();
  } catch (e) {
    return e.stack.split('\n')[3].split(process.cwd() + '/')[1].replace(')', '');
  }
}

/*
 * 错误日志
 */
function LogErr(err) {
  var res = getDate() + ' [' + getpos() + ']\n' + err.stack + '\n\n';
  console.log(res);
  log.write(res);
};
exports.LogErr = LogErr;

/*
 * 错误码
 */
var ERR = {
  REDIRECT: 4,
  INVALID_COOKIES: 3,
  WRONG_PASSWORD: 2,
  NOT_EXIST: 1,
  OK: 0,
  SYS: -1,
  ARGS: -2,
  PAGE_NOT_FOUND: -3,
  ACCESS_DENIED: -4,
  INVALID_SESSION: -5,
  FREQ_LIMIT: -6,
  WARNNING: -7,
};
exports.ERR = ERR;

/*
 * 失败渲染处理
 */
exports.FailRender = function(err, res, ret) {
  if (ret === ERR.SYS) {
    LogErr(err);
  }
  return res.render('err', {
    title: '发生错误',
    ret: ret,
    ERR: ERR
  });
};

/*
 * 失败响应处理
 */
exports.FailProcess = function(err, res, ret) {
  if (ret === ERR.SYS) {
    LogErr(err);
  }
  return res.send({ret: ret, msg: err.message});
};

/*
 * MD5加密
 */
var MD5 = exports.MD5 = function(str) {
  return crypto.createHash('md5').update(str).digest('base64');
};

/*
 * 正则检测图片类型
 */
exports.CheckImageType = function(type) {
  return (new RegExp('^(jpg|jpeg|png)$', 'i')).test(type);
};

/*
 * use to upload file
 */
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb){
    cb(null, encodeURIComponent(MD5(JSON.stringify(req.session.user)) + "_" + MD5(JSON.stringify(file))));
  }
});
exports.MulterUpload = require('multer')({
  storage: storage
});
