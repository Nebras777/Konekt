import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { Connection, ConnectionRelationship, ConnectionStatus } from '@/constants/types';

import { getContacts, updateContactStatus } from '../../../services/contacts';

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

function ContactRow({
  contact,
  onAccept,
}: {
  contact: Connection;
  onAccept: (id: string) => void;
}) {
  const { id, name, relationship, status } = contact;

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedView type="backgroundSelected" style={styles.avatar}>
        <ThemedText type="smallBold">{initials(name)}</ThemedText>
      </ThemedView>
      <View style={styles.rowText}>
        <ThemedText type="smallBold">{name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {RELATIONSHIP_LABEL[relationship] ?? relationship}
        </ThemedText>
      </View>

      {status === 'pending' ? (
        <Pressable onPress={() => onAccept(id)} accessibilityRole="button">
          {({ pressed }) => (
            <ThemedView
              type="backgroundSelected"
              style={[styles.acceptChip, pressed && styles.pressed]}>
              <ThemedText type="smallBold">Accept</ThemedText>
            </ThemedView>
          )}
        </Pressable>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          {STATUS_LABEL[status] ?? status}
        </ThemedText>
      )}
    </ThemedView>
  );
}

export default function PeopleScreen() {
  const router = useRouter();
  // null = still loading, [] = loaded but empty
  const [contacts, setContacts] = useState<Connection[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setContacts(await getContacts());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load people');
      setContacts([]);
    }
  }, []);

  // Reload whenever the tab regains focus (e.g. after adding someone).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Demo shortcut: on a real device the invited person accepts from their own
  // phone. Here, tapping "Accept" flips the invite pending -> active.
  const handleAccept = useCallback(
    async (id: string) => {
      setContacts(
        (prev) =>
          prev?.map((c) => (c.id === id ? { ...c, status: 'active' as ConnectionStatus } : c)) ??
          prev,
      );
      try {
        await updateContactStatus(id, 'active');
      } catch {
        load(); // fall back to the stored state if the write failed
      }
    },
    [load],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">People</ThemedText>
          <Pressable onPress={() => router.push('/signup')} accessibilityRole="button">
            {({ pressed }) => (
              <ThemedView
                type="backgroundSelected"
                style={[styles.headerAction, pressed && styles.pressed]}>
                <ThemedText type="smallBold">+ Create profile</ThemedText>
              </ThemedView>
            )}
          </Pressable>
        </View>

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
              <ContactRow key={contact.id} contact={contact} onAccept={handleAccept} />
            ))}
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  acceptChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
