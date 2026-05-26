import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, Image, ActivityIndicator,
  TouchableOpacity, StyleSheet, SafeAreaView, Modal, ScrollView,
} from 'react-native';
import { supabase } from '@/constants/supabase';

type Film = {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  poster_url: string;
  synopsis: string;
};

export default function HomeScreen() {
  const [films, setFilms]       = useState<Film[]>([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<Film | null>(null);
  const [loading, setLoading]   = useState(false);

  async function fetchFilms(query: string) {
    setLoading(true);
    let req = supabase.from('films').select('*').order('rating', { ascending: false });
    if (query.trim()) req = req.ilike('title', `%${query}%`);
    const { data } = await req;
    setFilms(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchFilms(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <SafeAreaView style={s.safe}>

      <View style={s.header}>
        <Text style={s.title}>🎬 Katalog Film</Text>
        <TextInput
          style={s.input}
          placeholder="Cari judul film..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={s.loadingText}>Mencari film...</Text>
        </View>
      ) : (
        <FlatList
          data={films}
          keyExtractor={item => String(item.id)}
          numColumns={3}
          contentContainerStyle={s.grid}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => setSelected(item)}>
              <Image source={{ uri: item.poster_url }} style={s.poster} />
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardMeta}>⭐ {item.rating} · {item.year}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            {selected && (
              <ScrollView>
                <Image source={{ uri: selected.poster_url }} style={s.detailPoster} />
                <View style={s.detailBody}>
                  <Text style={s.detailTitle}>{selected.title}</Text>
                  <Text style={s.detailMeta}>{selected.year} · {selected.genre} · ⭐ {selected.rating}</Text>
                  <Text style={s.detailSynopsis}>{selected.synopsis ?? 'Tidak ada sinopsis.'}</Text>
                </View>
                <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
                  <Text style={s.closeTxt}>Tutup</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#141414' },
  header:         { padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  title:          { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 12 },
  input:          { backgroundColor: '#1f1f1f', color: '#fff', borderRadius: 10,
                    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:    { color: '#888', fontSize: 13, marginTop: 8 },
  grid:           { padding: 8 },
  card:           { width: '30%', margin: '1.5%', backgroundColor: '#1f1f1f', borderRadius: 8, overflow: 'hidden' },
  poster:         { width: '100%', aspectRatio: 2/3, backgroundColor: '#2a2a2a' },
  cardTitle:      { fontSize: 11, fontWeight: '600', color: '#eee', padding: 4 },
  cardMeta:       { fontSize: 10, color: '#777', paddingHorizontal: 4, paddingBottom: 4 },
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  detailPoster:   { width: '100%', height: 260, backgroundColor: '#2a2a2a' },
  detailBody:     { padding: 16 },
  detailTitle:    { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  detailMeta:     { fontSize: 13, color: '#888', marginBottom: 12 },
  detailSynopsis: { fontSize: 14, color: '#ccc', lineHeight: 22 },
  closeBtn:       { margin: 16, backgroundColor: '#E50914', borderRadius: 10, padding: 12, alignItems: 'center' },
  closeTxt:       { color: '#fff', fontWeight: '700', fontSize: 14 },
});