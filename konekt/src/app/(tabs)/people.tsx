import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

type Contact = {
  name: string;
  relationship: string;
  status: string;
};

const CONTACTS: Contact[] = [
  { name: 'Mom', relationship: 'Parent', status: 'Sees your recaps' },
  { name: 'Sam', relationship: 'Friend', status: 'Invite pending' },
];

function ContactRow({ name, relationship, status }: Contact) {
  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <View style={styles.rowText}>
        <ThemedText type="smallBold">{name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {relationship}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {status}
      </ThemedText>
    </ThemedView>
  );
}

export default function PeopleScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">People</ThemedText>
        <View style={styles.list}>
          {CONTACTS.map((contact) => (
            <ContactRow key={contact.name} {...contact} />
          ))}
        </View>
      </SafeAreaView>
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
    paddingTop: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  list: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowText: {
    gap: Spacing.half,
  },
});
