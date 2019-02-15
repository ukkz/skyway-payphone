'use strict';

const DEBUG_LEVEL = 1; // 0:NONE,1:ERROR,2:WARNING,3:FULL
let my_peer_id = '';
let ButtonPushed = '';
let paid = false;
let peer;
let connection = null;






function convert_free_message(numbers) {
    const MESSAGE_FREE = {
        11:'ｱ',12:'ｲ',13:'ｳ',14:'ｴ',15:'ｵ',16:'A',17:'B',18:'C',19:'D',10:'1',
        21:'ｶ',22:'ｷ',23:'ｸ',24:'ｹ',25:'ｺ',26:'E',27:'F',28:'G',29:'H',20:'2',
        31:'ｻ',32:'ｼ',33:'ｽ',34:'ｾ',35:'ｿ',36:'I',37:'J',38:'K',39:'L',30:'3',
        41:'ﾀ',42:'ﾁ',43:'ﾂ',44:'ﾃ',45:'ﾄ',46:'M',47:'N',48:'O',49:'P',40:'4',
        51:'ﾅ',52:'ﾆ',53:'ﾇ',54:'ﾈ',55:'ﾉ',56:'Q',57:'R',58:'S',59:'T',50:'5',
        61:'ﾊ',62:'ﾋ',63:'ﾌ',64:'ﾍ',65:'ﾎ',66:'U',67:'V',68:'W',69:'X',60:'6',
        71:'ﾏ',72:'ﾐ',73:'ﾑ',74:'ﾒ',75:'ﾓ',76:'Y',77:'Z',78:'?',79:'!',70:'7',
        81:'ﾔ',82:'(',83:'ﾕ',84:')',85:'ﾖ',86:'#',87:'*',88:'@',89:'¥',80:'8',
        91:'ﾗ',92:'ﾘ',93:'ﾙ',94:'ﾚ',95:'ﾛ',96:'↓',97:'↑',98:':',99:';',90:'9',
        '01':'ﾜ','02':'ｦ','03':'ﾝ','04':'ﾞ','05':'ﾟ','06':'/','07':'ｰ','08':'&','09':' ','00':'0'
    };
    let res = '';
    numbers.split(/(.{2})/).filter(function(e){
        return e;
    }).forEach(function(key){
        if (key in MESSAGE_FREE) {
            res += MESSAGE_FREE[key];
        }
    })
    return res;
}

function convert_const_message(numbers) {
    const MESSAGE_CONST = {
        10:'TELｸﾀﾞｻｲ',11:'ｵｸﾚﾏｽ',12:'ﾍﾝｺｳｼﾏｽ',13:'ﾁｭｳｼﾃﾞｽ',14:'ｻｷﾆｶｴﾘﾏｽ',15:'ﾙｽﾃﾞﾝｱﾘ',16:'ｼﾞｶﾝﾃﾞｽ',17:'ｼﾞﾀｸ',18:'ｶｲｼｬ',19:'ｶﾞｯｺｳ',
        20:'ｼｷｭｳ!',21:'OKﾃﾞｽ',22:'NGﾃﾞｽ',23:'ｼｭｳｺﾞｳ!',24:'ﾏｯﾃﾃ!',25:'ﾅﾆｼﾃﾙﾉ?',26:'ﾄﾞｺﾆｲﾙﾉ?',27:'ｲﾏｲｿｶﾞｼｲ',28:'ｺﾞﾒﾝﾅｻｲ',29:'ｱﾘｶﾞﾄｳ'
    };
    if (numbers in MESSAGE_CONST) {
        return MESSAGE_CONST[numbers];
    } else {
        return '';
    }
}

function getQueryParams() {
    if (1 < document.location.search.length) {
        const query = document.location.search.substring(1);
        const params = query.split('&');
        const result = {};
        for(var param of params) {
            const element = param.split('=');
            const key = decodeURIComponent(element[0]);
            const value = decodeURIComponent(element[1]);
            result[key] = value;
        }
        return result;
    }
    return null;
}

function display(message) {
    document.getElementById('display').textContent = message;
}

function reset(display_message = 'THNX') {
    if (connection !== null) {
        if (ButtonPushed != '' && connection.open) {
            display_message = 'SENT'
            connection.send(ButtonPushed);
            console.log('Sent: "' + ButtonPushed + '"');
        } else {
            if (!connection.open) console.log('Connection: already closed');
        }
        setTimeout(function(){
            if (typeof(connection.close === 'function')) connection.close();
            connection = null;
            console.log('Connection: Reset');
        }, 3000);
    }
    display(display_message);
    ButtonPushed = '';
    if (paid) {
        console.log('Coin: stored');
        paid = false;
    }
}

function checkNumber(pushed_string) {
    console.log('Pushed: ' + pushed_string);
    const call_start = /^[0-9]{4}$/
    const free_mes = /\*2\*2([0-9]+)##$/;
    const const_mes = /\*05([0-9]+)##$/;
    
    if (connection === null) {
        // not connect (coin clicked)
        if (call_start.test(pushed_string)) {
            const bell_peer_id = 'bell-' + pushed_string;
            // check existance of target peer
            peer.listAllPeers(peers => {
                if (peers.indexOf(bell_peer_id) == -1) {
                    // peer not found
                    console.log('Peer "' + bell_peer_id + '" is not found');
                    reset('ERR.');
                } else {
                    display('____');
                    // try to connect
                    connection = peer.connect(bell_peer_id, {
                        serialization: "none"
                    });
                    setTimeout(function(){
                        connection.on('data', (data)=> {
                            // if data comes, show on log
                            console.log(data);
                        });
                        display(pushed_string);
                        console.log('Connection established with "'+ bell_peer_id +'" if no error occurs after here..');
                    }, 1000);
                }
            });
            return '';
        } else {
            return pushed_string;
        }
    } else {
        // after connected
        if (free_mes.test(pushed_string)) {
            const r = free_mes.exec(pushed_string);
            const converted = pushed_string.replace(r[0], convert_free_message(r[1]));
            console.log('Converted to free message: "' + pushed_string + '" to "' + converted + '"');
            return converted;
        } else if (const_mes.test(pushed_string)) {
            const r = const_mes.exec(pushed_string);
            const converted = pushed_string.replace(r[0], convert_const_message(r[1]));
            console.log('Converted to constant message: "' + pushed_string + '" to "' + converted + '"');
            return converted;
        } else {
            return pushed_string;
        }
    }
}

function coin() {
    if (!paid) {
        paid = true;
        console.log('Coin: paid');
        document.getElementById('display').textContent = 'CALL';
        peer.listAllPeers(peers => {
            let peers_list = 'Connected peers:';
            peers.forEach(function(peer_id) {
                peers_list += ' ' + peer_id;
                if (peer_id == my_peer_id) {
                    peers_list += '(me)'
                }
            });
            console.log(peers_list);
        });
    }
}

function push(num) {
    if (paid) {
        ButtonPushed += String(num);
        ButtonPushed = checkNumber(ButtonPushed);
    }
}









window.onload = ()=> {
    const query = getQueryParams();
    const apikey = query["apikey"];
    my_peer_id = 'payphone-' + Math.floor(Math.random()*10000).toString().padStart(4,'0')

    peer = new Peer(my_peer_id, {
        key: apikey,
        debug: DEBUG_LEVEL
    });

    peer.on('open', function () {
        //
    });

    peer.on('error', function (err) {
        console.log(err);
        reset('ERR.');
    });



    // for touch screen mobile browser..
    // prevent from clicking after touchstart
    let isTouch = false;
    $('.btn-call').on('touchstart click', function(event) {
        if (event.type === 'touchstart') isTouch = true;
        // ...
        if (isTouch) {
            isTouch = false;
        } else {
            // main process for "Number button push"
            const N = $(this).text();
            dtmf(N); // push tone
            push(N);
        }
    });
    $('#coin').on('touchstart click', function(event) {
        if (event.type === 'touchstart') isTouch = true;
        if (isTouch) {
            isTouch = false;
        } else {
            coin();
        }
    });
    $('#handle').on('touchstart click', function(event) {
        if (event.type === 'touchstart') isTouch = true;
        if (isTouch) {
            isTouch = false;
        } else {
            reset();
        }
    });
};




