const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
var Base64 = {

    keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this.keyStr.charAt(enc1) +
                this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) +
                this.keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    },

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = this.keyStr.indexOf(input.charAt(i++));
            enc2 = this.keyStr.indexOf(input.charAt(i++));
            enc3 = this.keyStr.indexOf(input.charAt(i++));
            enc4 = this.keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
    }
};
function sendMail(email, output, callback)
{
    // create reusable transporter object using the default SMTP transport
    /*let transporter = nodemailer.createTransport({
        service: 'gmail',
	    auth: {
	        xoauth2: xoauth2.createXOAuth2Generator({
	            user: 'support@selekt.in',
	            clientId: '550375863590-7tjjq0qhqfosssg1hk0io8sd16q40dtq.apps.googleusercontent.com',
	            clientSecret: 'J3k98DTnci6LHCxYqQHawvWC',
	            refreshToken: '1/KzCNkrUbjljzxAo-79rfbQ2vRqZBRpCX9i8pEgI4qLY'
	        })
	    }
    });*/
    let transporter = nodemailer.createTransport({
	    host: 'smtp.gmail.com',
	    port: 465,
	    secure: true,
	    auth: {
	        type: 'OAuth2',
	        user: 'support@selekt.in',
	        clientId: '550375863590-7tjjq0qhqfosssg1hk0io8sd16q40dtq.apps.googleusercontent.com',
	        clientSecret: 'J3k98DTnci6LHCxYqQHawvWC',
	        refreshToken: '1/KzCNkrUbjljzxAo-79rfbQ2vRqZBRpCX9i8pEgI4qLY',
	        accessToken: 'ya29.GltDBZQDOrNGD-BzcPcBDtc7NHGZzEJeu70Bfvwl2quPORig2yE4TmOeBoxQ9W9HOw_qxGj-bZwPfsZOFP2GeaHK8z8KTOO7U7lYzr7_c6FRbKVlDWtjvELCUaYw',
	        expires: 10
	    }
	});
    // setup email data with unicode symbolsx
    let mailOptions =
    {
        from: '"Support" <support@selekt.in>', // sender address
        to: email,
        subject: 'Selekt account verification mail', // Subject line
        text: 'Hello from SELEKT.in', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
    	console.log(error);
    	callback(!error);
    });
}
function verifyEmail(email, time, callback)
{
	let token1 = Base64Encode(email);
	let token2 = Base64Encode(time);
	const output = `
	    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f5f8fa; min-width: 350px; font-size: 1px; line-height: normal;">
	      <tr>
	        <td align="center" valign="top">
	          <!--[if (gte mso 9)|(IE)]>
	            <table border="0" cellspacing="0" cellpadding="0">
	              <tr>
	                <td align="center" valign="top" width="750">
	                <![endif]-->
	                <table cellpadding="0" cellspacing="0" border="0" width="750" class="table750"
	                style="width: 100%; max-width: 750px; min-width: 350px; background: #f5f8fa;">
	                  <tr>
	                    <td class="mob_pad" width="25" style="width: 25px; max-width: 25px; min-width: 25px;">&nbsp;</td>
	                    <td align="center" valign="top" style="background: #ffffff;">
	                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f5f8fa;">
	                        <tr>
	                          <td align="right" valign="top">
	                            <div class="top_pad" style="height: 25px; line-height: 25px; font-size: 23px;">&nbsp;</div>
	                          </td>
	                        </tr>
	                      </table>
	                      <table cellpadding="0" cellspacing="0" border="0" width="88%" style="width: 88% !important; min-width: 88%; max-width: 88%;">
	                        <tr>
	                          <td align="center" valign="top">
	                            <div style="height: 40px; line-height: 40px; font-size: 38px;">&nbsp;</div>
	                            <a href="#"
	                            style="display: block; max-width: 192px;">
	                              <img src="https://www.selekt.in/static/selekt/pics/icons/logo1.png?v=24779940" alt="Selekt.in" width="192"
	                              border="0" style="display: block; width: 192px;" />
	                            </a>
	                            <div class="top_pad2" style="height: 48px; line-height: 48px; font-size: 46px;">&nbsp;</div>
	                          </td>
	                        </tr>
	                      </table>
	                      <table cellpadding="0" cellspacing="0" border="0" width="88%" style="width: 88% !important; min-width: 88%; max-width: 88%;">
	                        <tr>
	                          <td align="left" valign="top"> <font face="'Source Sans Pro', sans-serif" color="#1a1a1a" style="font-size: 52px; line-height: 54px; font-weight: 300; letter-spacing: -1.5px;">
	                                  <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 52px; line-height: 54px; font-weight: 300; letter-spacing: -1.5px;">Confirm Your Email</span>
	                               </font>

	                            <div style="height: 21px; line-height: 21px; font-size: 19px;">&nbsp;</div> <font face="'Source Sans Pro', sans-serif" color="#000000" style="font-size: 20px; line-height: 28px;">
	                                  <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #000000; font-size: 20px; line-height: 28px;">
	                                  Hey,
	                                  </span>
	                               </font>

	                            <div style="height: 6px; line-height: 6px; font-size: 4px;">&nbsp;</div> <font face="'Source Sans Pro', sans-serif" color="#000000" style="font-size: 20px; line-height: 28px;">
	                                  <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #000000; font-size: 20px; line-height: 28px;">
	                                    We received a request to set up your SELEKT account to ${email}.
	                                    If this is correct, please confirm by clicking the button below.
	                                  </span>
	                               </font>

	                            <div style="height: 30px; line-height: 30px; font-size: 28px;">&nbsp;</div>
	                            <table class="mob_btn" cellpadding="0" cellspacing="0" border="0"
	                            style="background: #5dcccd; border-radius: 4px;">
	                              <tr>
	                                <td align="center" valign="top">
	                                  <a href="https://www.selekt.in/chatbot-solution/email-verification?token1='${token1}'&&token2='${token2}'"
	                                  target="_blank" style="display: block; border: 1px solid #5dcccd; border-radius: 4px; padding: 19px 27px; font-family: 'Source Sans Pro', Arial, Verdana, Tahoma, Geneva, sans-serif; color: #ffffff; font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;"> <font face="'Source Sans Pro', sans-serif" color="#ffffff" style="font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;">
	                   <span style="font-family: 'Source Sans Pro', Arial, Verdana, Tahoma, Geneva, sans-serif; color: #ffffff; font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;">Confirm Email</span>
	                </font>

	                                  </a>
	                                </td>
	                              </tr>
	                            </table>
	                            <div style="height: 90px; line-height: 90px; font-size: 88px;">&nbsp;</div>
	                          </td>
	                        </tr>
	                      </table>
	                      <table cellpadding="0" cellspacing="0" border="0" width="90%" style="width: 90% !important; min-width: 90%; max-width: 90%; border-width: 1px; border-style: solid; border-color: #e8e8e8; border-bottom: none; border-left: none; border-right: none;">
	                        <tr>
	                          <td align="left" valign="top">
	                            <div style="height: 28px; line-height: 28px; font-size: 26px;">&nbsp;</div>
	                          </td>
	                        </tr>
	                      </table>
	                      <table cellpadding="0" cellspacing="0" border="0" width="88%" style="width: 88% !important; min-width: 88%; max-width: 88%;">
	                        <tr>
	                          <td align="left" valign="top"> <font face="'Source Sans Pro', sans-serif" color="#7f7f7f" style="font-size: 17px; line-height: 23px;">
	                                  <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #7f7f7f; font-size: 17px; line-height: 23px;">Once you confirm, all future messages about your SELEKT account will be sent to ${email}.</span>
	                               </font>

	                            <div style="height: 30px; line-height: 30px; font-size: 28px;">&nbsp;</div>
	                          </td>
	                        </tr>
	                      </table>
	                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f5f8fa;">
	                        <tbody>
	                          <tr>
	                            <td align="center" valign="top">
	                              <div style="height: 34px; line-height: 34px; font-size: 32px;">&nbsp;</div>
	                              <table cellpadding="0" cellspacing="0" border="0" width="88%" style="width: 88% !important; min-width: 88%; max-width: 88%;">
	                                <tbody>
	                                  <tr>
	                                    <td align="center" valign="top">
	                                      <!--<table cellpadding="0" cellspacing="0" border="0" width="78%" style="min-width: 300px;">
	                                        <tbody>
	                                          <tr>
	                                            <td align="center" valign="top" width="23%">
	                                              <a href="mailto:info@selekt.in" style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;"> <font face="'Source Sans Pro', sans-serif" color="#1a1a1a" style="font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
	                                        <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">HELP</span>
	                                     </font>

	                                              </a>
	                                            </td>
	                                            <td align="center" valign="top" width="10%"> <font face="'Source Sans Pro', sans-serif" color="#1a1a1a" style="font-size: 17px; line-height: 17px; font-weight: bold;">
	                                     <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 17px; font-weight: bold;">•</span>
	                                  </font>

	                                            </td>
	                                            <td align="center" valign="top" width="23%">
	                                              <a href="#"
	                                              style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;"> <font face="'Source Sans Pro', sans-serif" color="#1a1a1a" style="font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
	                                        <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">SETTINGS</span>
	                                     </font>

	                                              </a>
	                                            </td>
	                                            <td align="center" valign="top" width="10%"> <font face="'Source Sans Pro', sans-serif" color="#1a1a1a" style="font-size: 17px; line-height: 17px; font-weight: bold;">
	                                        <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 17px; font-weight: bold;">•</span>
	                                     </font>

	                                            </td>
	                                            <td align="center" valign="top" width="23%">
	                                              <a href="#"
	                                              style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;"> <font face="'Source Sans Pro', sans-serif" color="#1a1a1a" style="font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
	                                           <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">PROFILE</span>
	                                        </font>

	                                              </a>
	                                            </td>
	                                          </tr>
	                                        </tbody>
	                                      </table>-->
	                                      <div style="height: 34px; line-height: 34px; font-size: 32px;">&nbsp;</div> <font face="'Source Sans Pro', sans-serif" color="#868686" style="font-size: 15px; line-height: 20px;">
	                            <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #868686; font-size: 15px; line-height: 20px;">
	                               <b>Selekt.in</b>
	                               <br>
	                               Building No. 14, Moreshwar Krupa, Opp. Paranjape Garden
	                                <br/>
	                                Datar Colony, Kanjurmarg East,Mumbai - 400042</span>
	                         </font>

	                                      <div style="height: 4px; line-height: 4px; font-size: 2px;">&nbsp;</div>
	                                      <div style="height: 3px; line-height: 3px; font-size: 1px;">&nbsp;</div>
	                                      <div style="height: 35px; line-height: 35px; font-size: 33px;">&nbsp;</div>
	                                    </td>
	                                  </tr>
	                                </tbody>
	                              </table>
	                            </td>
	                          </tr>
	                        </tbody>
	                      </table>
	                    </td>
	                    <td class="mob_pad" width="25" style="width: 25px; max-width: 25px; min-width: 25px;">&nbsp;</td>
	                  </tr>
	                </table>
	                <!--[if (gte mso 9)|(IE)]>
	                </td>
	              </tr>
	            </table>
	          <![endif]-->
	        </td>
	      </tr>
	    </table>`;
	sendMail(email, output, function(status){
		callback(status);
	});
}
function forgotPassword(email, time, callback)
{
	let token1 = Base64Encode(email);
	let token2 = Base64Encode(time);

	const output = `
		<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f5f8fa; min-width: 350px; font-size: 1px; line-height: normal;">
		  <tr>
		    <td align="center" valign="top">
		            <table cellpadding="0" cellspacing="0" border="0" width="750" class="table750"
		            style="width: 100%; max-width: 750px; min-width: 350px; background: #f5f8fa;">
		              <tr>
		                <td class="mob_pad" width="25" style="width: 25px; max-width: 25px; min-width: 25px;">&nbsp;</td>
		                <td align="center" valign="top" style="background: #ffffff;">
		                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f5f8fa;">
		                    <tr>
		                      <td align="right" valign="top">
		                        <div class="top_pad" style="height: 25px; line-height: 25px; font-size: 23px;">&nbsp;</div>
		                      </td>
		                    </tr>
		                  </table>
		                  <table cellpadding="0" cellspacing="0" border="0" width="88%" style="width: 88% !important; min-width: 88%; max-width: 88%;">
		                    <tr>
		                      <td align="center" valign="top">
		                        <div style="height: 40px; line-height: 40px; font-size: 38px;">&nbsp;</div>
		                        <a href="#"
		                        style="display: block; max-width: 192px;">
		                          <img src="https://www.selekt.in/static/selekt/pics/icons/logo1.png?v=24779940" alt="Selekt.in" width="192"
		                          border="0" style="display: block; width: 192px;" />
		                        </a>
		                        <div class="top_pad2" style="height: 48px; line-height: 48px; font-size: 46px;">&nbsp;</div>
		                      </td>
		                    </tr>
		                  </table>
		                  <table cellpadding="0" cellspacing="0" border="0" width="88%" style="width: 88% !important; min-width: 88%; max-width: 88%;">
		                    <tr>
		                      <td align="left" valign="top"> <font face="'Source Sans Pro', sans-serif" color="#1a1a1a" style="font-size: 52px; line-height: 54px; font-weight: 300; letter-spacing: -1.5px;">
		                              <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 52px; line-height: 54px; font-weight: 300; letter-spacing: -1.5px;">Reset password request</span>
		                           </font>

		                        <div style="height: 21px; line-height: 21px; font-size: 19px;">&nbsp;</div> <font face="'Source Sans Pro', sans-serif" color="#000000" style="font-size: 20px; line-height: 28px;">
		                              <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #000000; font-size: 20px; line-height: 28px;">
		                              Hey,
		                              </span>
		                           </font>

		                        <div style="height: 6px; line-height: 6px; font-size: 4px;">&nbsp;</div> <font face="'Source Sans Pro', sans-serif" color="#000000" style="font-size: 20px; line-height: 28px;">
		                              <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #000000; font-size: 20px; line-height: 28px;">
		                                We have received a request to reset your password for SELEKT account registerd with <a href="${email}" style="text-decoration: none;">${email}</a>
		                                If this is correct, please confirm by clicking the button below.
		                              </span>
		                           </font>
		                        <div style="height: 30px; line-height: 30px; font-size: 28px;">&nbsp;</div>
		                        <table class="mob_btn" cellpadding="0" cellspacing="0" border="0"
		                        style="background: #5dcccd; border-radius: 4px;">
		                          <tr>
		                            <td align="center" valign="top">
		                              <a href="https://www.selekt.in/chatbot-solution/change-password?token1='${token1}'&&token2='${token2}'"
		                              target="_blank" style="display: block; border: 1px solid #5dcccd; border-radius: 4px; padding: 19px 27px; font-family: 'Source Sans Pro', Arial, Verdana, Tahoma, Geneva, sans-serif; color: #ffffff; font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;"> <font face="'Source Sans Pro', sans-serif" color="#ffffff" style="font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;">
		               <span style="font-family: 'Source Sans Pro', Arial, Verdana, Tahoma, Geneva, sans-serif; color: #ffffff; font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;">Reset Password</span>
		            </font>

		                              </a>
		                            </td>
		                          </tr>
		                        </table>
		                        <div style="height: 90px; line-height: 90px; font-size: 88px;">&nbsp;</div>
		                      </td>
		                    </tr>
		                  </table>
		                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f5f8fa;">
		                    <tbody>
		                      <tr>
		                        <td align="center" valign="top">
		                          <div style="height: 34px; line-height: 34px; font-size: 32px;">&nbsp;</div>
		                          <table cellpadding="0" cellspacing="0" border="0" width="88%" style="width: 88% !important; min-width: 88%; max-width: 88%;">
		                            <tbody>
		                              <tr>
		                                <td align="center" valign="top">
		                            
		                                  <div style="height: 34px; line-height: 34px; font-size: 32px;">&nbsp;</div> <font face="'Source Sans Pro', sans-serif" color="#868686" style="font-size: 15px; line-height: 20px;">
		                        <span style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #868686; font-size: 15px; line-height: 20px;">
		                           <b>Selekt.in</b>
		                           <br>
		                           Building No. 14, Moreshwar Krupa, Opp. Paranjape Garden
		                            <br/>
		                            Datar Colony, Kanjurmarg East,Mumbai - 400042</span>
		                     </font>

		                                  <div style="height: 4px; line-height: 4px; font-size: 2px;">&nbsp;</div>
		                                  <div style="height: 3px; line-height: 3px; font-size: 1px;">&nbsp;</div>
		                                  <div style="height: 35px; line-height: 35px; font-size: 33px;">&nbsp;</div>
		                                </td>
		                              </tr>
		                            </tbody>
		                          </table>
		                        </td>
		                      </tr>
		                    </tbody>
		                  </table>
		                </td>
		                <td class="mob_pad" width="25" style="width: 25px; max-width: 25px; min-width: 25px;">&nbsp;</td>
		              </tr>
		            </table>
		    </td>
		  </tr>
		</table>`;
	sendMail(email, output, function(status){
		callback(status);
	});
}
function Base64Encode(string) {
    return Base64.encode(string.toString());
}

function Base64Decode(string) {
    return Base64.decode(string);
}
module.exports = {
	verifyEmail,
	forgotPassword,
	Base64Encode,
	Base64Decode
};