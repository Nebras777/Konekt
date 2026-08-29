import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { Connection, ConnectionRelationship, ConnectionStatus } from '@/constants/types';

import { getContacts } from '../../../services/contacts';

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

function ContactRow({ name, relationship, status }: Connection) {
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
      <ThemedText type="small" themeColor="textSecondary">
        {STATUS_LABEL[status] ?? status}
      </ThemedText>
    </ThemedView>
  );
}

export default function PeopleScreen() {
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">People</ThemedText>

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
              <ContactRow key={contact.id} {...contact} />
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
});
