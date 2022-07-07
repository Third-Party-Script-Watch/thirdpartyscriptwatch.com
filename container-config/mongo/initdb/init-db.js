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
    { 'script': script1._id, 'ts': '2022-07-01', 'sz': 70650, 'su': 170650 },
    { 'script': script1._id, 'ts': '2022-07-02', 'sz': 71692, 'su': 171692 },
    { 'script': script1._id, 'ts': '2022-07-03', 'sz': 70515, 'su': 170515 },
    { 'script': script1._id, 'ts': '2022-07-04', 'sz': 71360, 'su': 171360 },
    { 'script': script1._id, 'ts': '2022-07-05', 'sz': 71582, 'su': 171582 },
    { 'script': script1._id, 'ts': '2022-07-06', 'sz': 71282, 'su': 171282 },
    { 'script': script1._id, 'ts': '2022-07-07', 'sz': 71046, 'su': 171046 },
    { 'script': script1._id, 'ts': '2022-07-08', 'sz': 70609, 'su': 170609 },
    { 'script': script1._id, 'ts': '2022-07-09', 'sz': 70490, 'su': 170490 },
    { 'script': script1._id, 'ts': '2022-07-10', 'sz': 71447, 'su': 171447 },
    { 'script': script1._id, 'ts': '2022-07-11', 'sz': 70551, 'su': 170551 },
    { 'script': script1._id, 'ts': '2022-07-12', 'sz': 70736, 'su': 170736 },
    { 'script': script1._id, 'ts': '2022-07-13', 'sz': 71949, 'su': 171949 },
    { 'script': script1._id, 'ts': '2022-07-14', 'sz': 71152, 'su': 171152 },
    { 'script': script1._id, 'ts': '2022-07-15', 'sz': 72191, 'su': 172191 },
    { 'script': script1._id, 'ts': '2022-07-16', 'sz': 71156, 'su': 171156 },
    { 'script': script1._id, 'ts': '2022-07-17', 'sz': 70794, 'su': 170794 },
    { 'script': script1._id, 'ts': '2022-07-18', 'sz': 71477, 'su': 171477 },
    { 'script': script1._id, 'ts': '2022-07-19', 'sz': 71545, 'su': 171545 },
    { 'script': script1._id, 'ts': '2022-07-20', 'sz': 70614, 'su': 170614 },
    { 'script': script1._id, 'ts': '2022-07-21', 'sz': 70766, 'su': 170766 },
    { 'script': script1._id, 'ts': '2022-07-22', 'sz': 70305, 'su': 170305 },
    { 'script': script1._id, 'ts': '2022-07-23', 'sz': 72085, 'su': 172085 },
    { 'script': script1._id, 'ts': '2022-07-24', 'sz': 70747, 'su': 170747 },
    { 'script': script1._id, 'ts': '2022-07-25', 'sz': 71202, 'su': 171202 },
    { 'script': script1._id, 'ts': '2022-07-26', 'sz': 70828, 'su': 170828 },
    { 'script': script1._id, 'ts': '2022-07-27', 'sz': 70157, 'su': 170157 },
    { 'script': script1._id, 'ts': '2022-07-28', 'sz': 86234, 'su': 186234 },
    { 'script': script1._id, 'ts': '2022-07-29', 'sz': 91621, 'su': 191621 },
    { 'script': script1._id, 'ts': '2022-07-30', 'sz': 72182, 'su': 172182 },
    { 'script': script2._id, 'ts': '2022-07-15', 'sz': 54486, 'su': 154486 },
    { 'script': script2._id, 'ts': '2022-07-16', 'sz': 54486, 'su': 154486 }
]);