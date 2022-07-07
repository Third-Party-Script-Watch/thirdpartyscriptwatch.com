const script1 = {
    'id': 'google-analytics',
    'name': 'Google Analytics',
    'url': 'https://www.googletagmanager.com/gtag/js?id=G-LV4FGK973D'
};
db['scripts'].save(script1);
const script2 = {
    'id': 'google-maps',
    'name': 'Google Maps',
    'url': 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&v=weekly'
};
db['scripts'].save(script2);

db['script-metrics'].insertMany([
    { 'script': script1._id, 'ts': getOffsetDate(0), 'sz': 71692, 'su': 171692 },
    { 'script': script1._id, 'ts': getOffsetDate(1), 'sz': 70650, 'su': 170650 },
    { 'script': script1._id, 'ts': getOffsetDate(2), 'sz': 71692, 'su': 171692 },
    { 'script': script1._id, 'ts': getOffsetDate(3), 'sz': 70515, 'su': 170515 },
    { 'script': script1._id, 'ts': getOffsetDate(4), 'sz': 71360, 'su': 171360 },
    { 'script': script1._id, 'ts': getOffsetDate(5), 'sz': 71582, 'su': 171582 },
    { 'script': script1._id, 'ts': getOffsetDate(6), 'sz': 71282, 'su': 171282 },
    { 'script': script1._id, 'ts': getOffsetDate(7), 'sz': 71046, 'su': 171046 },
    { 'script': script1._id, 'ts': getOffsetDate(8), 'sz': 70609, 'su': 170609 },
    { 'script': script1._id, 'ts': getOffsetDate(9), 'sz': 70490, 'su': 170490 },
    { 'script': script1._id, 'ts': getOffsetDate(10), 'sz': 71447, 'su': 171447 },
    { 'script': script1._id, 'ts': getOffsetDate(11), 'sz': 70551, 'su': 170551 },
    { 'script': script1._id, 'ts': getOffsetDate(12), 'sz': 70736, 'su': 170736 },
    { 'script': script1._id, 'ts': getOffsetDate(13), 'sz': 71949, 'su': 171949 },
    { 'script': script1._id, 'ts': getOffsetDate(14), 'sz': 71152, 'su': 171152 },
    { 'script': script1._id, 'ts': getOffsetDate(15), 'sz': 72191, 'su': 172191 },
    { 'script': script1._id, 'ts': getOffsetDate(16), 'sz': 71156, 'su': 171156 },
    { 'script': script1._id, 'ts': getOffsetDate(17), 'sz': 70794, 'su': 170794 },
    { 'script': script1._id, 'ts': getOffsetDate(18), 'sz': 71477, 'su': 171477 },
    { 'script': script1._id, 'ts': getOffsetDate(19), 'sz': 71545, 'su': 171545 },
    { 'script': script1._id, 'ts': getOffsetDate(20), 'sz': 70614, 'su': 170614 },
    { 'script': script1._id, 'ts': getOffsetDate(21), 'sz': 70766, 'su': 170766 },
    { 'script': script1._id, 'ts': getOffsetDate(22), 'sz': 70305, 'su': 170305 },
    { 'script': script1._id, 'ts': getOffsetDate(23), 'sz': 72085, 'su': 172085 },
    { 'script': script1._id, 'ts': getOffsetDate(24), 'sz': 70747, 'su': 170747 },
    { 'script': script1._id, 'ts': getOffsetDate(25), 'sz': 71202, 'su': 171202 },
    { 'script': script1._id, 'ts': getOffsetDate(26), 'sz': 70828, 'su': 170828 },
    { 'script': script1._id, 'ts': getOffsetDate(27), 'sz': 70157, 'su': 170157 },
    { 'script': script1._id, 'ts': getOffsetDate(28), 'sz': 86234, 'su': 186234 },
    { 'script': script1._id, 'ts': getOffsetDate(29), 'sz': 91621, 'su': 191621 },
    { 'script': script1._id, 'ts': getOffsetDate(30), 'sz': 11111, 'su': 222222 },
    { 'script': script1._id, 'ts': getOffsetDate(31), 'sz': 11111, 'su': 222222 },
    { 'script': script1._id, 'ts': getOffsetDate(32), 'sz': 11111, 'su': 222222 },
    { 'script': script1._id, 'ts': getOffsetDate(33), 'sz': 11111, 'su': 222222 },
    { 'script': script1._id, 'ts': getOffsetDate(34), 'sz': 11111, 'su': 222222 },
    { 'script': script1._id, 'ts': getOffsetDate(35), 'sz': 11111, 'su': 222222 },
    { 'script': script2._id, 'ts': getOffsetDate(0), 'sz': 54486, 'su': 154486 },
    { 'script': script2._id, 'ts': getOffsetDate(1), 'sz': 54486, 'su': 154486 }
]);


function getOffsetDate(offset) {
    const d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    d.setDate(d.getDate() - offset);

    return d;
}