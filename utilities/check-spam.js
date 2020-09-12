'use strict';
const AV = require('leanengine');
const akismet = require('akismet-api');
const akismetClient = akismet.client({
    key  : process.env.AKISMET_KEY,
    blog : process.env.SITE_URL
});

exports.checkSpam = (comment, ip)=> {
    if (process.env.AKISMET_KEY === 'MANUAL_REVIEW') {
        console.log('Chế độ đánh giá thủ công đang được sử dụng, nhận xét sẽ được đăng sau khi xem xét ~');
        comment.setACL(new AV.ACL({"*":{"read":false}}));
        comment.set('isSpam', true);
        comment.save();
        return;
    }
    akismetClient.verifyKey(function(err, valid) {
        if (err) console.log('Akismet key Bất thường:', err.message);
        if (valid) {
            // TODO(1) 这里有缺陷
            comment.set('ip', ip);
            akismetClient.checkSpam({
                user_ip : ip,
                user_agent : comment.get('ua'),
                referrer : process.env.SITE_URL + comment.get('url'),
                permalink : process.env.SITE_URL + comment.get('url'),
                comment_type : 'comment',
                comment_author : comment.get('nick'),
                comment_author_email : comment.get('mail'),
                comment_author_url : comment.get('link'),
                comment_content : comment.get('comment'),
                // is_test : true // Default value is false
            }, function(err, spam) {
                if (err) console.log (`Phát hiện Spam ${err}`);
                if (spam) {
                    console.log('Bắt một bình luận spam và đốt nó cho chết! Dùng lửa nhẹ ~');
                    comment.set('isSpam', true);
                    comment.setACL(new AV.ACL({"*":{"read":false}}));
                    comment.save();
                    // comment.destroy();
                } else {
                    comment.set('isSpam', false);
                    comment.setACL(new AV.ACL({"*":{"read":true}}));
                    comment.save();
                    console.log('Phát hiện thư rác hoàn tất, bỏ qua ~');
                }
            });
        }
        else console.log('Akismet key Bất thường!');
    });
};
exports.submitSpam = (comment)=> {
    if (process.env.AKISMET_KEY === 'MANUAL_REVIEW') {
        return;
    }
    akismetClient.verifyKey(function(err, valid) {
        if (err) console.log('Akismet key Bất thường:', err.message);
        if (valid) {
            let ipAddr = comment.get('ip');
            akismetClient.submitSpam({
                user_ip : ipAddr,
                user_agent : comment.get('ua'),
                referrer : process.env.SITE_URL + comment.get('url'),
                permalink : process.env.SITE_URL + comment.get('url'),
                comment_type : 'comment',
                comment_author : comment.get('nick'),
                comment_author_email : comment.get('mail'),
                comment_author_url : comment.get('link'),
                comment_content : comment.get('comment'),
                // is_test : true // Default value is false
            }, function(err) {
                if (!err) {
                    console.log('Bình luận Spam đã được gửi');
                }
            });
        }
        else console.log('Akismet key Bất thường!');
    });
};
exports.submitHam = (comment)=> {
    if (process.env.AKISMET_KEY === 'MANUAL_REVIEW') {
        return;
    }
    akismetClient.verifyKey(function(err, valid) {
        if (err) console.log('Akismet key Bất thường:', err.message);
        if (valid) {
            let ipAddr = comment.get('ip');
            akismetClient.submitHam({
                user_ip : ipAddr,
                user_agent : comment.get('ua'),
                referrer : process.env.SITE_URL + comment.get('url'),
                permalink : process.env.SITE_URL + comment.get('url'),
                comment_type : 'comment',
                comment_author : comment.get('nick'),
                comment_author_email : comment.get('mail'),
                comment_author_url : comment.get('link'),
                comment_content : comment.get('comment'),
                // is_test : true // Default value is false
            }, function(err) {
                if (!err) {
                    console.log('Bình luận đã được đánh dấu là không phải Spam');
                }
            });
        }
        else console.log('Akismet key Bất thường!');
    });
};
