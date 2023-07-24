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
