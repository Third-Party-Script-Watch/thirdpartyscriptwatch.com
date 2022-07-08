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
    { 'script': script1._id, 'retrieved': getOffsetDate(0), 'contentLength': 86234, 'contentLengthUncompressed': 186234, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(1), 'contentLength': 91621, 'contentLengthUncompressed': 191621, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(2), 'contentLength': 71692, 'contentLengthUncompressed': 171692, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(3), 'contentLength': 70515, 'contentLengthUncompressed': 170515, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(4), 'contentLength': 71360, 'contentLengthUncompressed': 171360, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(5), 'contentLength': 71582, 'contentLengthUncompressed': 171582, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(6), 'contentLength': 71282, 'contentLengthUncompressed': 171282, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(7), 'contentLength': 71046, 'contentLengthUncompressed': 171046, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(8), 'contentLength': 70609, 'contentLengthUncompressed': 170609, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(9), 'contentLength': 70490, 'contentLengthUncompressed': 170490, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(10), 'contentLength': 71447, 'contentLengthUncompressed': 171447, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(11), 'contentLength': 70551, 'contentLengthUncompressed': 170551, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(12), 'contentLength': 70736, 'contentLengthUncompressed': 170736, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(13), 'contentLength': 71949, 'contentLengthUncompressed': 171949, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(14), 'contentLength': 71152, 'contentLengthUncompressed': 171152, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(15), 'contentLength': 72191, 'contentLengthUncompressed': 172191, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(16), 'contentLength': 71156, 'contentLengthUncompressed': 171156, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(17), 'contentLength': 70794, 'contentLengthUncompressed': 170794, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(18), 'contentLength': 71477, 'contentLengthUncompressed': 171477, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(19), 'contentLength': 71545, 'contentLengthUncompressed': 171545, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(20), 'contentLength': 70614, 'contentLengthUncompressed': 170614, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(21), 'contentLength': 70766, 'contentLengthUncompressed': 170766, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(22), 'contentLength': 70305, 'contentLengthUncompressed': 170305, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(23), 'contentLength': 72085, 'contentLengthUncompressed': 172085, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(24), 'contentLength': 70747, 'contentLengthUncompressed': 170747, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(25), 'contentLength': 71202, 'contentLengthUncompressed': 171202, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(26), 'contentLength': 70828, 'contentLengthUncompressed': 170828, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(27), 'contentLength': 70157, 'contentLengthUncompressed': 170157, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(28), 'contentLength': 71692, 'contentLengthUncompressed': 171692, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(29), 'contentLength': 70650, 'contentLengthUncompressed': 170650, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(30), 'contentLength': 11111, 'contentLengthUncompressed': 222222, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(31), 'contentLength': 11111, 'contentLengthUncompressed': 222222, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(32), 'contentLength': 11111, 'contentLengthUncompressed': 222222, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(33), 'contentLength': 11111, 'contentLengthUncompressed': 222222, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(34), 'contentLength': 11111, 'contentLengthUncompressed': 222222, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script1._id, 'retrieved': getOffsetDate(35), 'contentLength': 11111, 'contentLengthUncompressed': 222222, 'contentType': 'application/javascript', 'contentEncoding': 'br' },
    { 'script': script2._id, 'retrieved': getOffsetDate(0), 'contentLength': 54486, 'contentLengthUncompressed': 154486, 'contentType': 'application/javascript', 'contentEncoding': 'gzip' },
    { 'script': script2._id, 'retrieved': getOffsetDate(1), 'contentLength': 53961, 'contentLengthUncompressed': 1543961, 'contentType': 'application/javascript', 'contentEncoding': 'gzip' }
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