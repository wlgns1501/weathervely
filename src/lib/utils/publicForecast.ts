// TO_GRID = 위경도 -> XY 좌표
// FROM_GRID = XY 좌표 -> 위경도
export function dfsXyConvert(code: string, v1: number, v2: number): any {
  const { PI, tan, log, cos, pow, floor, sin, sqrt, atan, abs, atan2 } = Math;
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기1준점 Y좌표(GRID)

  const DEGRAD = PI / 180.0;
  const RADDEG = 180.0 / PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = tan(PI * 0.25 + slat2 * 0.5) / tan(PI * 0.25 + slat1 * 0.5);
  sn = log(cos(slat1) / cos(slat2)) / log(sn);
  let sf = tan(PI * 0.25 + slat1 * 0.5);
  sf = (pow(sf, sn) * cos(slat1)) / sn;
  let ro = tan(PI * 0.25 + olat * 0.5);
  ro = (re * sf) / pow(ro, sn);

  const rs: any = {};
  let ra, theta;

  if (code === 'TO_GRID') {
    rs.lat = v1;
    rs.lon = v2;
    ra = tan(PI * 0.25 + v1 * DEGRAD * 0.5);
    ra = (re * sf) / pow(ra, sn);
    theta = v2 * DEGRAD - olon;
    if (theta > PI) theta -= 2.0 * PI;
    if (theta < -PI) theta += 2.0 * PI;
    theta *= sn;
    rs.x = floor(ra * sin(theta) + XO + 0.5);
    rs.y = floor(ro - ra * cos(theta) + YO + 0.5);
  } else {
    rs.x = v1;
    rs.y = v2;
    const xn = v1 - XO;
    const yn = ro - v2 + YO;
    ra = sqrt(xn * xn + yn * yn);
    if (sn < 0.0) ra = -ra;
    let alat = pow((re * sf) / ra, 1.0 / sn);
    alat = 2.0 * atan(alat) - PI * 0.5;

    if (abs(xn) <= 0.0) {
      theta = 0.0;
    } else {
      if (abs(yn) <= 0.0) {
        theta = PI * 0.5;
        if (xn < 0.0) theta = -theta;
      } else theta = atan2(xn, yn);
    }
    const alon = theta / sn + olon;
    rs.lat = alat * RADDEG;
    rs.lon = alon * RADDEG;
  }
  return rs;
}

// 베이스 시간 가져오는 함수
export function getBaseDateTime(
  { minutes = 0, provide = 40 } = {},
  dt = Date.now(),
): any {
  const pad = (n, pad = 2) => ('0'.repeat(pad) + n).slice(-pad);
  const date = new Date(dt - provide * 60 * 1000); // provide분 전
  return {
    base_date:
      date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()),
    base_time: pad(date.getHours()) + pad(minutes),
  };
}

export function formatTime(hours: number): string {
  const paddedHours = hours.toString().padStart(2, '0');
  const formattedTime = `${paddedHours}00`;
  return formattedTime;
}

export function padNumber(num: number): string {
  return num.toString().padStart(2, '0');
}

// 중기기온예보구역 코드 - 오픈API 가이드 참조
export function midTaCode(city: string): string {
  switch (true) {
    case city.includes('부산'):
      return '11H20201';
    case city.includes('대구'):
      return '11H10701';
    case city.includes('인천'):
      return '11B20201';
    case city.includes('광주'):
      return '11F20501';
    case city.includes('대전'):
      return '11C20401';
    case city.includes('울산'):
      return '11H20101';
    case city.includes('세종'):
      return '11C20404';
    case city.includes('경기'):
      return '11B20601'; // 수원
    case city.includes('강원'):
      return '11D10301'; // 강릉
    case city.includes('충북'):
      return '11C10301'; // 청주
    case city.includes('충남'):
      return '11C20104'; // 홍성
    case city.includes('전북'):
      return '11F10201'; // 전주
    case city.includes('전남'):
      return '11F20603'; // 순천
    case city.includes('경북'):
      return '11H10201'; // 포항
    case city.includes('경남'):
      return '11H20701'; // 진주
    case city.includes('제주'):
      return '11G00201';
    case city.includes('서울'):
    default:
      console.log(city);
      return '11B10101';
  }
}

// 중기육상예보구역 코드 - 오픈API 가이드 참조
export function midLandFcstCode(city: string): string {
  switch (true) {
    case city.includes('강원'):
      return '11D10000';
    case city.includes('대전'):
    case city.includes('세종'):
    case city.includes('충남'):
      return '11C20000';
    case city.includes('충북'):
      return '11C10000';
    case city.includes('광주'):
    case city.includes('전남'):
      return '11F20000';
    case city.includes('전북'):
      return '11F10000';
    case city.includes('대구'):
    case city.includes('경북'):
      return '11H10000';
    case city.includes('부산'):
    case city.includes('울산'):
    case city.includes('경남'):
      return '11H20000';
    case city.includes('제주'):
      return '11G00000';
    case city.includes('서울'):
    case city.includes('인천'):
    case city.includes('경기'):
    default:
      return '11B00000';
  }
}
// // 상태 가져오는 함수
// export function getWeatherState(ptyCode: number, skyCode: number): string {
//   switch (ptyCode) {
//     case 1:
//       return 'rain';
//     case 2:
//       return 'snow/rain';
//     case 3:
//       return 'snow';
//     case 5:
//       return 'rainDrop';
//     case 6:
//       return 'snowDrift';
//     case 7:
//       return 'rainDrop/snowDrift';
//   }
//   switch (skyCode) {
//     case 1:
//       return 'clear';
//     case 3:
//       return 'partlyClear';
//     case 4:
//       return 'cloudy';
//   }
// }

// // 현재시간 : ex) 2023-07-16 23:00
// export function getCurrentDateTime(): string {
//   const now = new Date();

//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');
//   const hours = String(now.getHours()).padStart(2, '0');
//   // const minutes = String(now.getMinutes()).padStart(2, '0');

//   return `${year}-${month}-${day} ${hours}:00`;
// }

// // 메인 - getVilageFcst의 base_time
// export function getVilageFcstBaseTime(): any {
//   const currentDateTime = new Date();
//   const currentHour = currentDateTime.getHours();
//   const currentMinute = currentDateTime.getMinutes();
//   let baseYear = currentDateTime.getFullYear();
//   let baseMonth = currentDateTime.getMonth() + 1;
//   let baseDate = currentDateTime.getDate();
//   const baseTimes = [
//     '0200',
//     '0500',
//     '0800',
//     '1100',
//     '1400',
//     '1700',
//     '2000',
//     '2300',
//   ];
//   let baseTimeIndex = Math.floor(currentHour / 3);
//   if (currentHour < 2 || (currentHour === 2 && currentMinute <= 10)) {
//     baseTimeIndex = baseTimes.length - 1;
//     const prevDate = new Date(currentDateTime.getTime() - 86400000);
//     baseYear = prevDate.getFullYear();
//     baseMonth = prevDate.getMonth() + 1;
//     baseDate = prevDate.getDate();
//   } else {
//     baseTimeIndex -= 1;
//     if (baseTimeIndex < 0) baseTimeIndex = 0;
//   }

//   const baseTime = baseTimes[baseTimeIndex];
//   return {
//     base_date: `${baseYear}${padNumber(baseMonth)}${padNumber(baseDate)}`,
//     base_time: baseTime,
//   };
// }

// export function getYesterdayBaseDate(): string {
//   const currentDateTime = new Date();
//   const prevDate = new Date(currentDateTime.getTime() - 86400000);
//   const baseYear = prevDate.getFullYear();
//   const baseMonth = prevDate.getMonth() + 1;
//   const baseDate = prevDate.getDate();
//   return `${baseYear}${padNumber(baseMonth)}${padNumber(baseDate)}`;
// }
