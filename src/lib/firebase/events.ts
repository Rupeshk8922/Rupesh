export type Event = {
  timestamp: string;
  screen_name: string;
};

export async function getFirebaseEvents(): Promise<Event[]> {
  // TODO: Implement actual Firebase fetching logic here
  return [];
}