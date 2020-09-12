const AV = require('leanengine');
const mail = require('./utilities/send-mail');
const Comment = AV.Object.extend('Comment');
const request = require('request');
const spam = require('./utilities/check-spam');

function sendNotification(currentComment, defaultIp) {
    // 发送博主通知邮件
    if (currentComment.get('mail') !== process.env.BLOGGER_EMAIL) {
        mail.notice(currentComment);
    }

    let ip = currentComment.get('ip') || defaultIp;
    console.log('IP: %s', ip);
    spam.checkSpam(currentComment, ip);

    // AT评论通知
    let rid =currentComment.get('pid') || currentComment.get('rid');

    if (!rid) {
        console.log("This comment does not @ anyone");
        return;
    } else if (currentComment.get('isSpam')) {
        console.log('The comment is not approved, and the notification email will not be sent temporarily');
        return;
    }

    let query = new AV.Query('Comment');
    query.get(rid).then(function (parentComment) {
        if (parentComment.get('mail') && parentComment.get('mail') !== process.env.BLOGGER_EMAIL) {
            mail.send(currentComment, parentComment);
        } else {
            console.log('Anonymous by @, no notification will be sent');
        }
        
    }, function (error) {
        console.warn('Failed to get @object!');
    });
}

AV.Cloud.afterSave('Comment', function (req) {
    let currentComment = req.object;
    // 检查垃圾评论
    return sendNotification(currentComment, req.meta.remoteAddress);
});

AV.Cloud.define('resend_mails', function(req) {
    let query = new AV.Query(Comment);
    query.greaterThanOrEqualTo('createdAt', new Date(new Date().getTime() - 24*60*60*1000));
    query.notEqualTo('isNotified', true);
    // 如果你的评论量很大，可以适当调高数量限制，最高1000
    query.limit(200);
    return query.find().then(function(results) {
        new Promise((resolve, reject)=>{
            count = results.length;
            for (var i = 0; i < results.length; i++ ) {
                sendNotification(results[i], req.meta.remoteAddress);
            }
            resolve(count);
        }).then((count)=>{
            console.log(`Yesterday ${count} unsuccessful notification emails have been processed!`);
        }).catch(()=>{

        });
    });
  });

AV.Cloud.define('self_wake', function(req) {
    request(process.env.ADMIN_URL, function (error, response, body) {
        console.log('The self-wake-up task is executed successfully, and the response status code is:', response && response.statusCode);
      });
});
