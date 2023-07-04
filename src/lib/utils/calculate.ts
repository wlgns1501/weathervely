/* 
  현재시간을 기준으로 minutes까지 남은 시간을 milliseconds로 변환
  기상청 api
  - 초단기예보 : 매 시 45분마다 data update
  - 중기예보 : 매 시 ?분마다 data update
   */
export function calculateMS(minutes: number): number {
  const now = new Date();
  const currentMinutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  const remainingMinutes = minutes - (currentMinutes % minutes);
  const remainingSeconds = (60 - seconds) % 60;
  const remainingMilliseconds = 1000 - milliseconds;

  const totalMilliseconds =
    remainingMinutes * 60 * 1000 +
    remainingSeconds * 1000 +
    remainingMilliseconds;

  return totalMilliseconds;
}
