'use strict';
const nodemailer = require('nodemailer');

let config = {
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
}

if (process.env.SMTP_SERVICE != null) {
    config.service = process.env.SMTP_SERVICE;
} else {
    config.host = process.env.SMTP_HOST;
    config.port = parseInt(process.env.SMTP_PORT);
    config.secure = process.env.SMTP_SECURE === "false" ? false : true;
}

const transporter = nodemailer.createTransport(config);

transporter.verify(function(error, success) {
    if (error) {
        console.log('Cấu hình SMTP lỗi：', error);
    }
    if (success) {
        console.log("Cấu hình SMTP hoạt động tốt.");
    }
}); 

exports.notice = (comment) => {
    let SITE_NAME = process.env.SITE_NAME;
    let NICK = comment.get('nick');
    let COMMENT = comment.get('comment');
    let POST_URL = process.env.SITE_URL + comment.get('url') + '#' + comment.get('objectId');
    let SITE_URL = process.env.SITE_URL;

    let _template = process.env.MAIL_TEMPLATE_ADMIN || '<div style="border-top:2px solid #12ADDB;box-shadow:0 1px 3px #AAAAAA;line-height:180%;padding:0 15px 12px;margin:50px auto;font-size:12px;"><h2 style="border-bottom:1px solid #DDD;font-size:14px;font-weight:normal;padding:13px 0 10px 8px;">        Trang<a style="text-decoration:none;color: #12ADDB;" href="${SITE_URL}" target="_blank"> ${SITE_NAME}</a>Có bình luận mới.</h2><p><strong>${NICK}</strong> Đã bình luận：</p><div style="background-color: #f5f5f5;padding: 10px 15px;margin:18px 0;word-wrap:break-word;">            ${COMMENT}</div><p>Bạn có thể bấm vào liên kết<a style="text-decoration:none; color:#12addb" href="${POST_URL}" target="_blank">Đi tới trang bình luận</a><br></p></div></div>';
    let _subject = process.env.MAIL_SUBJECT_ADMIN || '${SITE_NAME} Có bình luận mới.';
    let emailSubject = eval('`' + _subject + '`');
    let emailContent = eval('`' + _template + '`');

    let mailOptions = {
        from: '"' + process.env.SENDER_NAME + '" <' + process.env.SENDER_EMAIL + '>',
        to: process.env.BLOGGER_EMAIL || process.env.SENDER_EMAIL,
        subject: emailSubject,
        html: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email thông báo cho blogger đã gửi: %s', info.response);
        comment.set('isNotified', true);
        comment.save();
    });
}

exports.send = (currentComment, parentComment)=> {
    let PARENT_NICK = parentComment.get('nick');
    let SITE_NAME = process.env.SITE_NAME;
    let NICK = currentComment.get('nick');
    let COMMENT = currentComment.get('comment');
    let PARENT_COMMENT = parentComment.get('comment');
    let POST_URL = process.env.SITE_URL + currentComment.get('url') + '#' + currentComment.get('objectId');
    let SITE_URL = process.env.SITE_URL;

    let _subject = process.env.MAIL_SUBJECT || '${PARENT_NICK}，Nhận xét của bạn ở 『${SITE_NAME}』đã nhận được trả lời.';
    let _template = process.env.MAIL_TEMPLATE || '<div style="border-top:2px solid #12ADDB;box-shadow:0 1px 3px #AAAAAA;line-height:180%;padding:0 15px 12px;margin:50px auto;font-size:12px;"><h2 style="border-bottom:1px solid #DDD;font-size:14px;font-weight:normal;padding:13px 0 10px 8px;">        Bình luận trên trang<a style="text-decoration:none;color: #12ADDB;" href="${SITE_URL}" target="_blank"> ${SITE_NAME}</a>Nhận được trả lời mới.</h2>${PARENT_NICK} Đã trả lời：<div style="padding:0 12px 0 12px;margin-top:18px"><div style="background-color: #f5f5f5;padding: 10px 15px;margin:18px 0;word-wrap:break-word;">            ${PARENT_COMMENT}</div><p><strong>${NICK}</strong> Đã bình luận：</p><div style="background-color: #f5f5f5;padding: 10px 15px;margin:18px 0;word-wrap:break-word;">            ${COMMENT}</div><p>Bạn có thể bấm vào <a style="text-decoration:none; color:#12addb" href="${POST_URL}" target="_blank">Liên kết này</a> để đi tới trang bình luận. Rất vui được đón bạn quay lại <a style="text-decoration:none; color:#12addb" href="${SITE_URL}" target="_blank">${SITE_NAME}</a>。<br></p></div></div>';
    let emailSubject = eval('`' + _subject + '`');
    let emailContent = eval('`' + _template + '`');

    let mailOptions = {
        from: '"' + process.env.SENDER_NAME + '" <' + process.env.SENDER_EMAIL + '>', // sender address
        to: parentComment.get('mail'),
        subject: emailSubject,
        html: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email thông báo được gửi thành công: %s', info.response);
        currentComment.set('isNotified', true);
        currentComment.save();
    });
};
