const result=[]
var Imap = require('imap'),
    inspect = require('util').inspect;
    var imap = new Imap({
        user: 'email@gmail.com',
        password: 'password',
        host: 'imap.gmail.com',
        //imap.mail.yahoo.com - for yahoo
        // imap.yourdomain.ext -for aruba
        port: 993,
        tls: true,
        tlsOptions: {rejectUnauthorized: false}
      });
      

function openInbox(cb) {
    // openReadOnly = false
    imap.openBox('Inbox', false, cb);
}

imap.once('ready', function () {
    openInbox(function (err, box) {
        if (err) throw err;

        // Search emails having "UNSEEN" property 
        imap.search([ 'UNSEEN', ['SINCE', 'May 20, 2021'] ], function (err, results) {
            if (err) throw err;
            //try and catch block
            try {
                var f = imap.fetch(results, {bodies: 'TEXT'});
                f.on('message', function (msg, seqno) {
                    msg.on('body', function (stream, info) {
                        var buffer = '';
                        stream.on('data', function (chunk) {
                            buffer += chunk.toString('utf8');
                        });
                        stream.once('end', function () {

                            // Push ID and Date into Result
                            msg.once('attributes', function (attrs) {

                                let uid = attrs.uid;
                                let date =attrs.date
                                const object={uid,date}
                                result.push(object)
                               
                            });

                        });
                    });
                    console.log(result.length)
                    return result.length
                    
                    
                });
               
                f.once('end', function () {
                    imap.end();
                });
                
              
            } catch (errorWhileFetching) {
                console.log(errorWhileFetching.message);
                imap.end();
            }

        });
    });
});



imap.connect();