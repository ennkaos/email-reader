var Imap = require('imap'),
    inspect = require('util').inspect;
let result = []
async function openInbox(cb) {
    // openReadOnly = false
    await imap.openBox('Inbox', false, cb);
}
var imap = new Imap({
    user: '',
    password: '',
    host: 'imap.gmail.com',
    //imap.mail.yahoo.com - for yahoo
    // imap.yourdomain.ext -for aruba
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
});

const test = async () => {
    imap.connect();

    const res = new Promise((resolve, reject) => {
        imap.once('ready', () => {
            openInbox((err, box) => {
                if (err) throw err;
        
                // Search emails having "UNSEEN" property 
                imap.search(['UNSEEN', ['SINCE', 'May 20, 2021']], (err, results) => {
                    if (err) throw err;
                    //try and catch block
                    try {
                        var f = imap.fetch(results, { bodies: 'TEXT' });
                        f.on('message', async (msg, seqno) => {
                            msg.on('body', function (stream, info) {
                                var buffer = '';
                                stream.on('data', function (chunk) {
                                    buffer += chunk.toString('utf8');
                                });
                                stream.once('end', () => {
        
                                    // Push ID and Date into Result
                                    msg.once('attributes', (attrs) => {
        
                                        let uid = attrs.uid;
                                        let date = attrs.date
                                        const object = { uid, date }
                                        result.push(object)
        
                                    });
        
                                });
                            });
                            // console.log(result.length)
                            return result.length
        
        
                        });
        
                        f.once('end', () => {
                            imap.end();
                            return resolve(result);
                        });
        
        
                    } catch (errorWhileFetching) {
                        // console.log(errorWhileFetching.message);
                        imap.end();
                        return reject();
                    }
        
                });
            });
        });
    });
    
    return res;
}

const withAsync = async () => {
    console.log('before!');
    await test()
        .then(res => {
            console.log('how many unread emails', res);
        })
        .catch(err => console.log(err));
    console.log('afetr!');
};
