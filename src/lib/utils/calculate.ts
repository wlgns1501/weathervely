// Cache 유효시간 계산
export function calculateMS(minutes = 1440): number {
  const now = new Date();
  const currentTimestamp = now.getTime();

  let targetTime: Date;
  if (minutes >= 1440) {
    const targetDay = Math.round(minutes / 1440);
    targetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + targetDay,
    );
  } else {
    const remainingMinutes = minutes - (now.getMinutes() % minutes);
    targetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes() + remainingMinutes,
    );
  }

  const targetTimestamp = targetTime.getTime();
  const remainingMilliseconds = targetTimestamp - currentTimestamp;

  return remainingMilliseconds;
}

export function getCalculateSensoryTemperature(
  temperatureValue: number,
  windValueMps: number,
  relativeHumidity: number,
): number {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  let sensoryTemp: number;
  // 여름 - 4,5,6,7,8,9
  // 겨울 - 1,2,3,10,11,12
  if (currentMonth >= 4 && currentMonth <= 9) {
    // 섭씨 , 습도 - 체감온도 계산 ( 여름 )
    sensoryTemp = calculateHumidityCelsius(temperatureValue, relativeHumidity);
  } else {
    // 섭씨 , 풍량 - 체감온도 계산 ( 겨울 )
    sensoryTemp = calculateWindChillCelsius(temperatureValue, windValueMps);
  }
  return sensoryTemp;
}

// 겨울 - JAG/TI 체감온도 모델 공식 ( Joint Action Group for Temperature Indices )
function calculateWindChillCelsius(
  temperatureValue: number,
  windValueMps: number,
): number {
  const windSpeedKmph = windValueMps * 3.6;
  const sensoryTemperature =
    13.12 +
    0.6215 * temperatureValue -
    11.37 * Math.pow(windSpeedKmph, 0.16) +
    0.3965 * temperatureValue * Math.pow(windSpeedKmph, 0.16);
  return sensoryTemperature <= temperatureValue || sensoryTemperature > 10
    ? temperatureValue
    : sensoryTemperature;
}

// 여름 - 기상청 공식
function calculateHumidityCelsius(
  temperatureValue: number,
  relativeHumidity: number,
): number {
  // get 습구온도
  const humidity = getTw(temperatureValue, relativeHumidity);
  console.log('temperatureValue', temperatureValue);
  console.log('relativeHumidity', relativeHumidity);

  const c1 = 0.55399 * humidity;
  const c2 = 0.45535 * temperatureValue;
  const c3 = 0.0022 * Math.pow(humidity, 2);
  const c4 = 0.00278 * humidity * temperatureValue;

  const temperature = -0.2442 + c1 + c2 - c3 + c4 + 3.0;

  return temperature;
}

function getTw(temperatureValue: number, relativeHumidity: number): number {
  const c1 =
    temperatureValue *
    Math.atan(0.151977 * Math.sqrt(relativeHumidity + 8.313659));
  const c2 = Math.atan(temperatureValue + relativeHumidity);
  const c3 = Math.atan(relativeHumidity - 1.67633);
  const c4 =
    0.00391838 *
    Math.pow(relativeHumidity, 1.5) *
    Math.atan(0.023101 * relativeHumidity);
  const Tw = c1 + c2 - c3 + c4 - 4.686035;
  return Tw;
}

// 여름 - 열지수 공식 - 안쓰이는중
function calculateHeatIndexCelsius(
  temperatureValue: number,
  relativeHumidity: number,
): number {
  const c1 = -8.78469475556;
  const c2 = 1.61139411;
  const c3 = 2.33854883889;
  const c4 = -0.14611605;
  const c5 = -0.012308094;
  const c6 = -0.0164248277778;
  const c7 = 0.002211732;
  const c8 = 0.00072546;
  const c9 = -0.000003582;

  const heatIndexCelsius =
    c1 +
    c2 * temperatureValue +
    c3 * relativeHumidity +
    c4 * temperatureValue * relativeHumidity +
    c5 * Math.pow(temperatureValue, 2) +
    c6 * Math.pow(relativeHumidity, 2) +
    c7 * Math.pow(temperatureValue, 2) * relativeHumidity +
    c8 * temperatureValue * Math.pow(relativeHumidity, 2) +
    c9 * Math.pow(temperatureValue, 2) * Math.pow(relativeHumidity, 2);

  return heatIndexCelsius;
}
