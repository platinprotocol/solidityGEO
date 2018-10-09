function generateLatitude() {
    let latitude = Math.floor(Math.random() * 89000000);

    if (isNegative())
        latitude *= -1;

    return latitude;
}

function generateLongetude() {
    let longitude = Math.floor(Math.random() * 179000000);

    if (isNegative())
        longitude *= -1;

    return longitude;
}

function isNegative() {
    return Math.floor(Math.random() * 10) % 2 == 0;
}

module.exports = function(amount) {
    let points = Array();
    for (let i = 0; i < amount; i++) {
        let lat = generateLatitude();
        let lon = generateLongetude();
        points.push(lat);
        points.push(lon);
    }

    return points;
};