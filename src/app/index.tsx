import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, Image, ActivityIndicator,
  TouchableOpacity, StyleSheet, SafeAreaView, Modal, ScrollView,
} from 'react-native';
import { supabase } from '@/constants/supabase';

type Film = {
  id: number; title: string; year: number;
  rating: number; genre: string; poster_url: string; synopsis: string;
};

export default function HomeScreen() {
  const [films, setFilms]       = useState<Film[]>([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<Film | null>(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      let q = supabase.from('films').select('*').order('rating', { ascending: false });
      if (search.trim()) q = q.ilike('title', `%${search}%`);
      const { data } = await q;
      setFilms(data ?? []);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <SafeAreaView style={s.safe}>

      <Text style={s.title}>🎬 Katalog Film</Text>
      <TextInput style={s.input} placeholder="Cari film..." placeholderTextColor="#555" value={search} onChangeText={setSearch} />

      {loading
        ? <ActivityIndicator style={s.center} size="large" color="#E50914" />
        : <FlatList
            data={films}
            keyExtractor={i => String(i.id)}
            numColumns={3}
            contentContainerStyle={{ padding: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.card} onPress={() => setSelected(item)}>
                <Image source={{ uri: item.poster_url }} style={s.poster} />
                <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
      }

      <Modal visible={!!selected} animationType="slide" transparent={true} onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          {selected && (
            <ScrollView style={s.sheet}>
              <Image source={{ uri: selected.poster_url }} style={s.detailPoster} />
              <Text style={s.detailTitle}>{selected.title}</Text>
              <Text style={s.detailMeta}>{selected.year} · {selected.genre} · ⭐ {selected.rating}</Text>
              <Text style={s.detailSynopsis}>{selected.synopsis ?? '-'}</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
                <Text style={s.closeTxt}>Tutup</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#141414', padding: 16, paddingTop: 50 },
  title:         { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 12 },
  input:         { backgroundColor: '#1f1f1f', color: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 },
  center:        { flex: 1 },
  card:          { width: '30%', margin: '1.5%', borderRadius: 8, overflow: 'hidden' },
  poster:        { width: '100%', aspectRatio: 2/3, backgroundColor: '#2a2a2a' },
  cardTitle:     { fontSize: 10, color: '#eee', padding: 4 },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '85%' },
  detailPoster:  { width: '100%', height: 250, borderRadius: 12, marginBottom: 12 },
  detailTitle:   { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  detailMeta:    { fontSize: 13, color: '#888', marginBottom: 10 },
  detailSynopsis:{ fontSize: 14, color: '#ccc', lineHeight: 22, marginBottom: 16 },
  closeBtn:      { backgroundColor: '#E50914', borderRadius: 10, padding: 12, alignItems: 'center' },
  closeTxt:      { color: '#fff', fontWeight: '700' },
});