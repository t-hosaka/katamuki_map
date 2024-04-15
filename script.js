let os;
if (
    navigator.userAgent.indexOf("iPhone") > 0 ||
    navigator.userAgent.indexOf("iPad") > 0 ||
    navigator.userAgent.indexOf("iPod") > 0
) {
    os = "iphone";
    console.log("iPhone");
} else if (navigator.userAgent.indexOf("Android") > 0) {
    os = "android";
    console.log("Android");
} else {
    os = "pc";
    console.log("PC");
}

document.querySelector("#os").value = os;

let map;
let human;

window.addEventListener("DOMContentLoaded", init);

if (os == "iphone") {
    window.addEventListener(
        "deviceorientation",
        detectDirection,
        true
    );
} else if (os == "android") {
    window.addEventListener(
        "deviceorientationabsolute",
        detectDirection,
        true
    );
}
// DOM初期化
function init() {
    // 初回に現在地緯度経度を取得
    navigator.geolocation.getCurrentPosition(
        initMap,
        err => {
            alert(err.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Map初期化
function initMap(initPos) {
    // #mapidに地理院タイルマップをレンダリング
    map = L.map("mapid").setView(
        [initPos.coords.latitude, initPos.coords.longitude],
        17
    );

    L.tileLayer(
        "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
            attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院地図</a>"
        }
    ).addTo(map);

    // 現在地緯度経度を継続取得
    let watchId = navigator.geolocation.watchPosition(
        pos => {
            moveMapFollowingHuman(
                pos.coords.latitude,
                pos.coords.longitude,
                pos.coords.heading
            );
        },
        err => {
            window.alert(err.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// 現在地変更ハンドラ
function moveMapFollowingHuman(latitude, longitude, heading) {

    // 現在地circle描画を削除
    if (human) {
        map.removeLayer(human);
    }
    // 現在地circle描画
    human = L.circle([latitude, longitude], {
        color: "blue",
        fillColor: "#30f",
        fillOpacity: 0.5,
        radius: 10
    }).addTo(map);
    human._path.id = "human";

    // 現在地を示すエレメントの画面位置座標を取得
    var clientRect = human._path.getBoundingClientRect();

    // 画面の左端から、要素の左端までの距離
    var x = clientRect.left;

    // 画面の上端から、要素の上端までの距離
    var y = clientRect.top;

    let beam = document.querySelector("#beam");
    let h = beam.clientHeight;
    let w = beam.clientWidth;
    beam.style.top = y - 40 + "px";
    beam.style.left = x - 30 + "px";
}

function detectDirection(e) {
    let absolute = event.absolute;
    let alpha = event.alpha;
    let beta = event.beta;
    let gamma = event.gamma;

    let degrees;
    if (os == "iphone") {
        degrees = e.webkitCompassHeading;
    } else {
        degrees = compassHeading(alpha, beta, gamma);
    }
    document.querySelector("#degree").value = degrees;

    let beam = document.querySelector("#beam");
    beam.style.transform = "rotate(" + degrees + "deg)";

    let iPhone = document.querySelector("#iPhone");
    iPhone.value = e.webkitCompassHeading;

    let accuracy = document.querySelector("#accuracy");
    accuracy.value = e.webkitCompassAccuracy;
}

function compassHeading(alpha, beta, gamma) {
    var degtorad = Math.PI / 180; // Degree-to-Radian conversion

    var _x = beta ? beta * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos(_x);
    var cY = Math.cos(_y);
    var cZ = Math.cos(_z);
    var sX = Math.sin(_x);
    var sY = Math.sin(_y);
    var sZ = Math.sin(_z);

    // Calculate Vx and Vy components
    var Vx = -cZ * sY - sZ * sX * cY;
    var Vy = -sZ * sY + cZ * sX * cY;

    // Calculate compass heading
    var compassHeading = Math.atan(Vx / Vy);

    // Convert compass heading to use whole unit circle
    if (Vy < 0) {
        compassHeading += Math.PI;
    } else if (Vx < 0) {
        compassHeading += 2 * Math.PI;
    }

    return compassHeading * (180 / Math.PI); // Compass Heading (in degrees)
}

function permitGeolocation() {
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            if (response === "granted") {
                window.addEventListener(
                    "deviceorientation",
                    detectDirection
                );
            }
        })
        .catch(console.error);
}