import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, Image, ActivityIndicator,
  TouchableOpacity, StyleSheet, SafeAreaView, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Film | null>(null);

  const fetchFilms = useCallback(async (query: string) => {
    setLoading(true);
    let req = supabase.from('films').select('*').order('rating', { ascending: false });
    if (query.trim()) req = req.ilike('title', `%${query}%`);
    const { data } = await req;
    setFilms(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchFilms(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.titleSmall}>KATALOG</Text>
          <Text style={s.titleBig}>🎬 Film</Text>
        </View>
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={s.input}
            placeholder="Cari judul film..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={s.loadingText}>Mencari film...</Text>
        </View>
      ) : films.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="film-outline" size={48} color="#555" />
          <Text style={s.emptyText}>Film tidak ditemukan</Text>
        </View>
      ) : (
        <FlatList
          key="3col"
          data={films}
          keyExtractor={i => String(i.id)}
          numColumns={3}
          contentContainerStyle={s.grid}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={() => setSelected(item)}>
              <Image source={{ uri: item.poster_url }} style={s.poster} />
              <View style={s.badge}>
                <Text style={s.badgeText}>⭐ {item.rating}</Text>
              </View>
              <View style={s.info}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.cardMeta}>{item.year} · {item.genre}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            {selected && (
              <ScrollView>
                <Image source={{ uri: selected.poster_url }} style={s.detailPoster} />
                <View style={s.detailBody}>
                  <Text style={s.detailTitle}>{selected.title}</Text>
                  <View style={s.detailRow}>
                    <Text style={s.detailMeta}>{selected.year}</Text>
                    <Text style={s.detailMeta}>·</Text>
                    <Text style={s.detailMeta}>{selected.genre}</Text>
                    <Text style={s.detailMeta}>·</Text>
                    <Text style={s.detailRating}>⭐ {selected.rating}</Text>
                  </View>
                  <Text style={s.detailSynopsis}>{selected.synopsis ?? 'Tidak ada sinopsis.'}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#141414' },
  header:        { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
                   backgroundColor: '#141414', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTop:     { marginBottom: 14 },
  titleSmall:    { fontSize: 11, color: '#E50914', fontWeight: '700', letterSpacing: 3 },
  titleBig:      { fontSize: 28, fontWeight: '700', color: '#fff' },
  searchBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f1f1f',
                   borderRadius: 10, paddingHorizontal: 12, borderWidth: 0.5, borderColor: '#333' },
  input:         { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 10, marginLeft: 8 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:   { color: '#888', fontSize: 13, marginTop: 8 },
  emptyText:     { color: '#555', fontSize: 14, marginTop: 8 },
  grid:          { padding: 8 },
  card:          { width: '30%', margin: '1.5%', backgroundColor: '#1f1f1f', borderRadius: 8, overflow: 'hidden' },
  poster:        { width: '100%', aspectRatio: 2/3, backgroundColor: '#2a2a2a' },
  badge:         { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.75)',
                   borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  badgeText:     { fontSize: 10, color: '#FFD700', fontWeight: '600' },
  info:          { padding: 6 },
  cardTitle:     { fontSize: 11, fontWeight: '600', color: '#eee' },
  cardMeta:      { fontSize: 10, color: '#777', marginTop: 1 },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  closeBtn:      { position: 'absolute', top: 12, right: 12, zIndex: 10,
                   backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 4 },
  detailPoster:  { width: '100%', height: 280, backgroundColor: '#2a2a2a' },
  detailBody:    { padding: 16 },
  detailTitle:   { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  detailRow:     { flexDirection: 'row', marginBottom: 12 },
  detailMeta:    { fontSize: 13, color: '#888', marginRight: 6 },
  detailRating:  { fontSize: 13, color: '#FFD700' },
  detailSynopsis:{ fontSize: 14, color: '#ccc', lineHeight: 22 },
});