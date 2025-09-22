import { User } from 'src/app/auth/entities/user.entity';
 

export class UserResponseMapper {
  static toLoginResponse(user: any, userRecord: any, customToken: string) {
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || user.username,
      firebaseToken: customToken,
      mvp_type: user.mvp_type,
      personality_archetype: user.personality_archetype,
      bond_level: user.bond_level,
      description: user.descriptions,
    };
  }
}
