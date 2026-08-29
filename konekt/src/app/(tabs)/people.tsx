import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type {
  Connection,
  ConnectionGroup,
  ConnectionRelationship,
  ConnectionStatus,
  Profile,
} from '@/constants/types';
import { useAuth } from '@/hooks/use-auth';

import {
  getContacts,
  getIncomingInvites,
  inviteProfile,
  updateContactGroup,
  updateContactStatus,
} from '../../../services/contacts';
import { getProfiles } from '../../../services/profiles';

const GROUPS: { value: ConnectionGroup; label: string }[] = [
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
  { value: 'other', label: 'Other' },
];

const RELATIONSHIP_LABEL: Record<ConnectionRelationship, string> = {
  parent: 'Parent',
  grandparent: 'Grandparent',
  sibling: 'Sibling',
  partner: 'Partner',
  friend: 'Friend',
  other: 'Other',
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  pending: 'Invite pending',
  active: 'Sees your recaps',
  declined: 'Declined',
};

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

/**
 * A connection you created. Status is read-only here: only the invited person
 * can accept, from their own account. The group is yours to set.
 */
function ContactRow({
  contact,
  onSetGroup,
}: {
  contact: Connection;
  onSetGroup: (group: ConnectionGroup) => void;
}) {
  const { name, relationship, status } = contact;
  const group = contact.group ?? 'other';

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedView type="backgroundSelected" style={styles.avatar}>
        <ThemedText type="smallBold">{initials(name)}</ThemedText>
      </ThemedView>
      <View style={styles.rowText}>
        <ThemedText type="smallBold">{name}</ThemedText>
        {/* Only shown when it says something. Inviting a Konekt profile doesn't
            ask how you know the person, so it defaults to 'other' — printing
            that under every invited name is noise, and the Family / Friends /
            Other chips already cover the filing. */}
        {relationship && relationship !== 'other' ? (
          <ThemedText type="small" themeColor="textSecondary">
            {RELATIONSHIP_LABEL[relationship] ?? relationship}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.rowRight}>
        <View style={styles.groupRow}>
          {GROUPS.map(({ value, label }) => (
            <Pressable
              key={value}
              onPress={() => onSetGroup(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: group === value }}>
              {({ pressed }) => (
                <ThemedView
                  type={group === value ? 'backgroundSelected' : 'backgroundElement'}
                  style={[styles.groupChip, pressed && styles.pressed]}>
                  <ThemedText type="small">{label}</ThemedText>
                </ThemedView>
              )}
            </Pressable>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {status === 'pending' ? 'Invite sent' : (STATUS_LABEL[status] ?? status)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

export default function PeopleScreen() {
  const { profile } = useAuth();
  // null = still loading, [] = loaded but empty
  const [contacts, setContacts] = useState<Connection[] | null>(null);
  const [incoming, setIncoming] = useState<Connection[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [inviting, setInviting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) {
      setContacts([]);
      return;
    }
    setError(null);
    try {
      const [mine, invites, everyone] = await Promise.all([
        getContacts(profile.id),
        getIncomingInvites(profile.id),
        getProfiles(),
      ]);
      setContacts(mine);
      setIncoming(invites);
      setProfiles(everyone);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load people');
      setContacts([]);
    }
  }, [profile]);

  // Reload whenever the tab regains focus (e.g. after adding someone).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Answering an invite happens on the invited person's own account: accepting
  // is what authorises the sender to deliver recaps, so it can't be done by the
  // person who sent it.
  const handleRespond = useCallback(
    async (id: string, status: ConnectionStatus) => {
      setIncoming((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      try {
        await updateContactStatus(id, status);
      } catch {
        load(); // fall back to the stored state if the write failed
      }
    },
    [load],
  );

  const handleSetGroup = useCallback(
    async (id: string, group: ConnectionGroup) => {
      // Optimistic: filing someone should feel instant.
      setContacts((prev) => prev?.map((c) => (c.id === id ? { ...c, group } : c)) ?? prev);
      try {
        await updateContactGroup(id, group);
      } catch {
        load(); // reload the stored state if the write failed
      }
    },
    [load],
  );

  const handleInvite = useCallback(
    async (target: Profile) => {
      if (!profile) return;
      setInviting(target.id);
      try {
        await inviteProfile({
          ownerId: profile.id,
          ownerName: profile.name,
          profileId: target.id,
          name: target.name,
        });
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not send that invite');
      } finally {
        setInviting(null);
      }
    },
    [profile, load],
  );

  /**
   * Who sent an invite. Prefers the live profile — a stored ownerName is a
   * snapshot from invite time, and invites written before ownerName existed
   * have none at all, which is what rendered "Someone".
   */
  function inviterName(connection: Connection): string {
    const live = profiles.find((p) => p.id === connection.ownerId);
    return live?.name ?? connection.ownerName ?? 'Someone';
  }

  const pendingIncoming = incoming.filter((c) => c.status === 'pending');
  // Invites you've accepted: these people's recaps arrive in your Recaps tab.
  const sharingWithYou = incoming.filter((c) => c.status === 'active');

  // Everyone signed up, minus yourself and anyone you've already invited.
  const alreadyConnected = new Set((contacts ?? []).map((c) => c.profileId).filter(Boolean));
  const invitable = profiles.filter(
    (p) => p.id !== profile?.id && !alreadyConnected.has(p.id),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">People</ThemedText>

        {pendingIncoming.length > 0 ? (
          <View style={styles.list}>
            <ThemedText type="smallBold">Invites for you</ThemedText>
            {pendingIncoming.map((invite) => (
              <ThemedView key={invite.id} type="backgroundElement" style={styles.inviteRow}>
                <ThemedText type="smallBold">
                  {inviterName(invite)} wants to share their days
                </ThemedText>
                <View style={styles.respondRow}>
                  <Pressable
                    onPress={() => handleRespond(invite.id, 'declined')}
                    accessibilityRole="button">
                    {({ pressed }) => (
                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={pressed ? styles.pressed : undefined}>
                        Decline
                      </ThemedText>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => handleRespond(invite.id, 'active')}
                    accessibilityRole="button">
                    {({ pressed }) => (
                      <ThemedView
                        type="backgroundSelected"
                        style={[styles.inviteChip, pressed && styles.pressed]}>
                        <ThemedText type="small">Accept</ThemedText>
                      </ThemedView>
                    )}
                  </Pressable>
                </View>
              </ThemedView>
            ))}
          </View>
        ) : null}

        {sharingWithYou.length > 0 ? (
          <View style={styles.list}>
            <ThemedText type="smallBold">Sharing with you</ThemedText>
            {sharingWithYou.map((connection) => (
              <ThemedView key={connection.id} type="backgroundElement" style={styles.inviteRow}>
                <ThemedText type="smallBold">{inviterName(connection)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Their recaps arrive in Recaps
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        ) : null}

        {contacts === null ? (
          <View style={styles.centre}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <Message text={error} />
        ) : contacts.length === 0 ? (
          <Message text="No people yet. Invite someone to start sharing your recaps." />
        ) : (
          <View style={styles.list}>
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onSetGroup={(group) => handleSetGroup(contact.id, group)}
              />
            ))}
          </View>
        )}

        {profile && invitable.length > 0 ? (
          <View style={styles.list}>
            <ThemedText type="smallBold">On Konekt</ThemedText>
            {invitable.map((person) => (
              <ThemedView key={person.id} type="backgroundElement" style={styles.inviteRow}>
                <ThemedText type="smallBold">{person.name}</ThemedText>
                <Pressable
                  onPress={() => handleInvite(person)}
                  disabled={inviting === person.id}
                  accessibilityRole="button">
                  {({ pressed }) => (
                    <ThemedView
                      type="backgroundSelected"
                      style={[styles.inviteChip, pressed && styles.pressed]}>
                      <ThemedText type="small">
                        {inviting === person.id ? 'Inviting…' : 'Invite'}
                      </ThemedText>
                    </ThemedView>
                  )}
                </Pressable>
              </ThemedView>
            ))}
          </View>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function Message({ text }: { text: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.messageCard}>
      <ThemedText type="default" themeColor="textSecondary">
        {text}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  groupRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  groupChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.three,
  },
  respondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  inviteChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
  list: {
    gap: Spacing.three,
  },
  messageCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
