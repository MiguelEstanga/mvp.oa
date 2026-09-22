import { User } from 'src/app/auth/entities/user.entity';

type SafeUser = Omit<
  User,
  'password' | 'reset_password_code' | 'reset_password_expires' | 'token_fcm'
>;

export class UserResponseMapper {
  /**
   * Strips credential/reset-code fields before a user leaves the API.
   * Lists the safe fields explicitly (rather than destructuring the unsafe
   * ones away) so a new sensitive column added to the entity later isn't
   * leaked by default.
   */
  static toSafeUser(user: User): SafeUser;
  static toSafeUser(user: User | null): SafeUser | null;
  static toSafeUser(user: User | null): SafeUser | null {
    if (!user) {
      return null;
    }

    return {
      firebase_uid: user.firebase_uid,
      username: user.username,
      email: user.email,
      personality_archetype: user.personality_archetype,
      bond_level: user.bond_level,
      personality_active: user.personality_active,
      mvp_type: user.mvp_type,
      birth_day: user.birth_day,
      descriptions: user.descriptions,
      state: user.state,
      created_at: user.created_at,
    };
  }

  static toLoginResponse(user: any, userRecord: any, customToken: string) {
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || user.username,
    
      mvp_type: user.mvp_type,
      personality_archetype: user.personality_archetype,
      bond_level: user.bond_level,
      description: user.descriptions,
      state:user.state,
        firebaseToken: customToken,
    };
  }
}
