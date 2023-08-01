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
  // 열지수 계산
  const heatIndex = calculateHeatIndexCelsius(
    temperatureValue,
    relativeHumidity,
  );

  // 체감온도 계산
  const windChill = calculateWindChillCelsius(temperatureValue, windValueMps);

  // 열지수와 체감온도 중 더 높은 값을 반환 or Month 값 구분해서 보여줄까...?
  return Math.max(heatIndex, windChill);
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

// 여름 - 열지수 공식
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
