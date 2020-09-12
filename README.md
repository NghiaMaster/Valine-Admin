Valine Admin is an extension and enhancement of [Valine's Comment system](https://deserts.io/diy-a-comment-system/), which mainly implements comment email notification, comment management, and spam comment filtering. Support fully customized email notification templates. Realize accurate spam filtering based on Akismet API. In addition, the use of cloud functions and other technologies has solved the dormancy problem of the free version of the cloud engine, supports automatic wake-up of the cloud engine, and automatic reissue of missed emails. Compatible with multiple versions of Valine maintained by Yundanfengqing and Deserts.

> NOTE: **This project is based on LeanCloud cloud engine sample code, you can copy and modify it freely. Contains some tricks to maximize the use of resources, but do not abuse free resources. Refer to this document and related articles on the Deserts blog to indicate the source. **

[Comment on online demos and related functional tests](https://panjunwen.github.io/Valine/)
Please refer to the [latest version of the blog](https://deserts.io/valine-admin-document/) for installation tutorial .

## 快速部署

 1. On the [Leancloud](https://leancloud.cn/dashboard/#/apps) cloud engine setting interface, fill in the code base and save it：https://github.com/DesertsP/Valine-Admin.git

![Image](https://cloud.panjunwen.com/2018/09/ping-mu-kuai-zhao-2018-09-15-xia-wu-12-56-04.png)

 2. On the settings page, set the environment variables and the Web second-level domain name.

![Image](https://cloud.panjunwen.com/2018/09/ping-mu-kuai-zhao-2018-09-15-xia-wu-3-40-48.png)

<div class="table-wrap">

Varible | Example | Description
--- | ------ | ------
SITE_NAME | Deserts | [Required] Blog name
SITE_URL  | https://deserts.io | [Required] Homepage address 
**SMTP_SERVICE** | QQ | [New support] mail service providers, support QQ, 163,126, Gmail and [more](https://nodemailer.com/smtp/well-known/#supported-services) 
SMTP_USER | xxxxxx@qq.com | [Required] SMTP login user
SMTP_PASS | ccxxxxxxxxch | [Required] SMTP login password (QQ mailbox needs to obtain a separate password) 
SENDER_NAME | Deserts | [Required] sender 
SENDER_EMAIL | xxxxxx@qq.com | [Required] Sending email
ADMIN_URL | https://xxx.leanapp.cn/ | [Recommendation] Web host second-level domain name, used to automatically wake up
BLOGGER_EMAIL | xxxxx@gmail.com | [Optional] Blogger notification recipient address, default is SENDER_EMAIL
AKISMET_KEY | xxxxxxxxxxxx | [Optional] Akismet Key is used for spam detection, set to MANUAL_REVIEW to enable manual review, leave it blank to not use anti-spam

</div>
    
**The above required parameters must be set correctly.**

The second-level domain name is used for comment management, example [https://deserts.avosapps.us](https://deserts.leanapp.cn) 。

![Image](https://cloud.panjunwen.com/2018/09/ping-mu-kuai-zhao-2018-09-15-xia-wu-1-06-41.png)

 3. Switch to the deployment tab, use master for the branch, and click deploy

![Image](https://cloud.panjunwen.com/2018/09/ping-mu-kuai-zhao-2018-09-15-xia-wu-12-56-50.png)

The first deployment will take some time.

![Image](https://cloud.panjunwen.com/2018/09/ping-mu-kuai-zhao-2018-09-15-xia-wu-1-00-45.png)

 4. Comment management. Access the set secondary domain name `https://secondary.avosapps.us/sign-up`，and register the administrator login information, Example：[https://deserts.avosapps.us/sign-up](https://deserts.avosapps.us/sign-up) 
    <img src="https://cloud.panjunwen.com/2018/10/ping-mu-kuai-zhao-2018-10-22-xia-wu-9-35-51.png" alt="Image" style="
    width: 600px;">

    >Note：If you use the original version of Valine, if the registration page does not display directly to the login page, please manually delete all the data in the _User table.

  After that, you can pass `https://secodary.avosapps.us/` management comments.。
    
 5. Scheduled task settings

Currently, two cloud function timing tasks are implemented: (1) Automatic wake-up, regular access to the Web APP secondary domain name to prevent cloud engine sleep; (2) Regular check every day for missed email notifications within 24 hours.

Enter the cloud engine-timed task, create a timer, and create two timed tasks.

Select the self-wake cloud function. The Cron expression is `0 */25 0-15,23 * * ?`， which means that the cloud engine is accessed every 25 minutes from 7 am to 23 pm, and the `ADMIN_URL` environment variables must be set correctly:


<img src="https://cloud.panjunwen.com/2018/09/ping-mu-kuai-zhao-2018-09-18-xia-wu-2-57-43.png" alt="唤醒云引擎">

Select the resend-mails cloud function, the Cron expression is `0 10 23 * * ?`, which means that the notification emails that have been missed in the past 24 hours are checked and reissued at 7:10 every morning:

<img src="https://cloud.panjunwen.com/2018/09/ping-mu-kuai-zhao-2018-09-18-xia-wu-2-57-53.png" alt="通知检查" >


**After adding the timer, remember to click Start to take effect.**

**At this point, Valine Admin has been able to work normally. The following are optional advanced configurations.**
-----------------

### Email notification template

The email notification template is set in the cloud engine environment variable, and the notification email title and content template can be customized.

Varible | Example | Description
--- | ------ | ------
MAIL_SUBJECT | ${PARENT_NICK}，your comment on ${SITE_NAME} received a response | [Optional]@Notification email subject (title) template
MAIL_TEMPLATE | as follows	 | [Optional]@Notification email content template
MAIL_SUBJECT_ADMIN | New comment on ${SITE_NAME} | [Optional] Blogger email notification subject template
MAIL_TEMPLATE_ADMIN | as follows	 | [Optional] Blogger email notification content template

There are two types of email notifications, namely notification by @notification and blogger notification. Both templates can be fully customized. The classic blue style template is used by default (the source of the style is unknown).

The default @notification email content template is as follows:

```html
<div style="border-top:2px solid #12ADDB;box-shadow:0 1px 3px #AAAAAA;line-height:180%;padding:0 15px 12px;margin:50px auto;font-size:12px;"><h2 style="border-bottom:1px solid #DDD;font-size:14px;font-weight:normal;padding:13px 0 10px 8px;">        Bình luận trên trang<a style="text-decoration:none;color: #12ADDB;" href="${SITE_URL}" target="_blank"> ${SITE_NAME}</a>Nhận được trả lời mới.</h2>${PARENT_NICK} Đã trả lời：<div style="padding:0 12px 0 12px;margin-top:18px"><div style="background-color: #f5f5f5;padding: 10px 15px;margin:18px 0;word-wrap:break-word;">            ${PARENT_COMMENT}</div><p><strong>${NICK}</strong> Đã bình luận：</p><div style="background-color: #f5f5f5;padding: 10px 15px;margin:18px 0;word-wrap:break-word;">            ${COMMENT}</div><p>Bạn có thể bấm vào <a style="text-decoration:none; color:#12addb" href="${POST_URL}" target="_blank">Liên kết này</a> để đi tới trang bình luận. Rất vui được đón bạn quay lại <a style="text-decoration:none; color:#12addb" href="${SITE_URL}" target="_blank">${SITE_NAME}</a>。<br></p></div></div>
```

The effect is as follows:

![mail-blue-template](https://cloud.panjunwen.com/2018/09/wei-ming-ming.png)

The available variables in the @notification template are as follows (note, this is a mail template variable, please do not confuse it with cloud engine environment variables):

Template variable	 | Description
----|----
SITE_NAME | Blog name
SITE_URL | Blog homepage address
POST_URL | Article address (full path)
PARENT_NICK | Recipient's nickname (by @name, parent commenter)
PARENT_COMMENT | Parent comment content
NICK | New commenter nickname
COMMENT | New comment content

The default blogger notification email content template is as follows:

```html
<div style="border-top:2px solid #12ADDB;box-shadow:0 1px 3px #AAAAAA;line-height:180%;padding:0 15px 12px;margin:50px auto;font-size:12px;"><h2 style="border-bottom:1px solid #DDD;font-size:14px;font-weight:normal;padding:13px 0 10px 8px;">        Trang<a style="text-decoration:none;color: #12ADDB;" href="${SITE_URL}" target="_blank"> ${SITE_NAME}</a>Có bình luận mới.</h2><p><strong>${NICK}</strong> Đã bình luận：</p><div style="background-color: #f5f5f5;padding: 10px 15px;margin:18px 0;word-wrap:break-word;">            ${COMMENT}</div><p>Bạn có thể bấm vào liên kết<a style="text-decoration:none; color:#12addb" href="${POST_URL}" target="_blank">Đi tới trang bình luận</a><br></p></div></div>
```

Bloggers notice is consistent with the available variables @ notice in the mail template,**```PARENT_NICK``` and ```PARENT_COMMENT``` variables are no longer available.**


## Spam detection

> Akismet (Automattic Kismet) is a widely used spam filtering system. Its author is the famous WordPress founder Matt Mullenweg. Akismet is also a plug-in installed by default in WordPress. It is widely used. The design goal is to help blog sites filter messages Spam.
> After having Akismet, basically there is no need to worry about spam messages. After enabling Akismet, when the blog receives a comment, it will automatically submit it to Akismet and compare it with the blacklist on Akismet. If it is included in the blacklist, the comment will be marked as spam and will not be published .

If you do not have an Akismet Key, you can go to [AKISMET FOR DEVELOPERS to apply for one for free](https://akismet.com/development/)；
**when AKISMET_KEY is set to MANUAL_REVIEW, enable manual review mode** if you don't need anti-spam, the Akismet Key environment variable can be ignored.

**In order to achieve more accurate spam recognition, the criteria for collection include the commenter’s IP address, browser information, etc. in addition to the comment content, email address, and website address. However, these data are only used in the background of the cloud engine to ensure privacy and Safety.**

**If you use the latest Valine and Valine Admin on this site, and set the Akismet Key, you can effectively block spam comments. Comments marked as spam can be unmarked on the management page.**

Environment variable	 | Example | Description
--- | ------ | ------
AKISMET_KEY | xxxxxxxxxxxx | [Optional] Akismet Key for spam detection

## Prevent cloud engine sleep

The official statement about automatic sleep: [View](https://leancloud.cn/docs/leanengine_plan.html#hash633315134)

At present, the latest version of Valine Admin can realize self-wakeup, that is, periodically request the web application address in the LeanCloud cloud engine to prevent sleep. Email notifications missed during the night sleep period will be automatically reissued the next morning.**Be sure to set the ADMIN_URL environment variable in the configuration, and add two cloud function timing tasks in step 5.**

## Troubleshooting

- The deployment failed, please attach the picture in the comments, or go to Github to initiate an issue
- After sending the email failed, make sure that the environment variables are all right, restart the cloud engine
    ![image](https://cloud.panjunwen.com/2018/09/ping-mu-kuai-zhao-2018-09-15-xia-wu-5-22-56.png)
    
- `PARENT*` Do not use related parameters in the blogger notification template (do not mix templates)

-  Click the link in the email to jump to the corresponding comment. The implementation of this detail requires a little extra code on frontend:

``` javascript
<script>
    if(window.location.hash){
        var checkExist = setInterval(function() {
           if ($(window.location.hash).length) {
              $('html, body').animate({scrollTop: $(window.location.hash).offset().top-90}, 1000);
              clearInterval(checkExist);
           }
        }, 100);
    }
</script>
```

- Customize the mail server address and port information, delete the SMTP_SERVICE environment variable, and add the following variables:

VARIABLE | EXAMPLE | DESCRIPTION
----|------|------
SMTP_HOST | smtp.qq.com | [Optional] When SMTP_SERVICE is left blank, customize the SMTP server address
SMTP_PORT | 465 | [Optional] When SMTP_SERVICE is left blank, customize the SMTP port
SMTP_SECURE | true | [Optional] Fill in when SMTP_SERVICE is left blank

## Related items

Front end of the comment box:：[Valine on Github](https://github.com/panjunwen/Valine)

[Disqus2LeanCloud data migration](http://disqus.panjunwen.com/)

------------------

## Developer documentation

**The following content is only used for LeanEngine development, ordinary users do not need to bother**

First confirm that the [Node.js](http://nodejs.org/) runtime environment and [LeanCloud command line tools](https://leancloud.cn/docs/leanengine_cli.html)，have been installed on this machine , and then execute the following instructions:

```
$ git clone https://github.com/DesertsP/Valine-Admin.git
$ cd Valine-Admin
```

Installation dependencies:


```
npm install
```

Log in and link the app:

```
lean login
lean switch
```

Startup project:

```
lean up
```

Then you can access your application at [localhost:3000](http://localhost:3000).

Deploy to the preparation environment (if there is no preparation environment, deploy directly to the production environment):
```
lean deploy
```

## License

[MIT License](https://github.com/panjunwen/LeanComment/blob/master/LICENSE)
