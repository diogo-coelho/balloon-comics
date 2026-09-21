import { UserEventType } from "../../../domain/user/events/user-event-type";

export const AUTH_EXCHANGE = 'balloon.auth.events';

export const EventRoutingMapper = {
  [UserEventType.CREATED]: 'auth.user.created.v1',
  [UserEventType.UPDATED]: 'auth.user.updated.v1',
  [UserEventType.DELETED]: 'auth.user.deleted.v1', 
}