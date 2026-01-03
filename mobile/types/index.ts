export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  status: 'upcoming' | 'planning' | 'past';
  daysLeft?: number;
  timeLabel?: string;
}

export interface User {
  name: string;
  avatarUrl: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  TripList: undefined;
  NewTrip: { tripId?: string };
  TripDetail: { tripId: string };
  Profile: undefined;
};

export type RootTabParamList = {
  TripsTab: undefined;
  ExploreTab: undefined;
  SavedTab: undefined;
  ProfileTab: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
