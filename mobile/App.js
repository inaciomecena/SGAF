import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { db } from './src/services/db';
import { authService } from './src/services/authService';
import { fieldService } from './src/services/fieldService';
import { syncEngine } from './src/services/syncEngine';
import { storage } from './src/services/storage';

const styles = {
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  box: { backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8, backgroundColor: '#fff' },
  button: { backgroundColor: '#059669', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', marginBottom: 8 },
  buttonSecondary: { backgroundColor: '#1f2937', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { backgroundColor: '#e5e7eb', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { color: '#111827', fontWeight: '600' },
  item: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#fff' },
  itemSelected: { borderColor: '#059669', borderWidth: 2 },
  itemTitle: { fontWeight: '700', color: '#111827' },
  itemText: { color: '#374151', marginTop: 2 }
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('admin@sgaf.com');
  const [senha, setSenha] = useState('123456');
  const [status, setStatus] = useState('');
  const [produtores, setProdutores] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [selectedProdutor, setSelectedProdutor] = useState(null);
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [veiculoModalOpen, setVeiculoModalOpen] = useState(false);
  const [atendimentosLocal, setAtendimentosLocal] = useState([]);
  const [conflitosSync, setConflitosSync] = useState([]);
  const [formProdutor, setFormProdutor] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: ''
  });
  const [formAtendimento, setFormAtendimento] = useState({
    produtor_server_id: '',
    data_atendimento: '',
    motivo: '',
    observacoes: '',
    recomendacoes: '',
    latitude: '',
    longitude: '',
    veiculo_id: '',
    km_saida: '',
    km_chegada: ''
  });
  const [lastAtendimentoLocalId, setLastAtendimentoLocalId] = useState('');

  useEffect(() => {
    let unmounted = false;
    const bootstrap = async () => {
      await db.init();
      const currentUser = await authService.currentUser();
      const list = await fieldService.listarProdutoresLocais();
      const veiculosList = await fieldService.listarVeiculos();
      if (!unmounted) {
        setUser(currentUser);
        setProdutores(list);
        setVeiculos(veiculosList);
        setReady(true);
      }
    };
    bootstrap();
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(connected);
      if (connected && (await storage.getToken())) {
        try {
          const result = await syncEngine.runFullSync();
          setStatus(`Sincronizado: ${result.pushed} enviados, ${result.pulled} recebidos`);
          const refreshed = await fieldService.listarProdutoresLocais();
          setProdutores(refreshed);
        } catch (error) {
          setStatus(error.message || 'Falha na sincronização automática');
        }
      }
    });
    return () => {
      unmounted = true;
      unsubscribe();
    };
  }, []);

  const syncLabel = useMemo(() => (online ? 'Online' : 'Offline'), [online]);

  const refreshLocal = async () => {
    const data = await fieldService.listarProdutoresLocais();
    setProdutores(data);
    const conflitos = await fieldService.listarConflitosSync();
    setConflitosSync(conflitos);
    if (selectedProdutor?.server_id) {
      const atendimentos = await fieldService.listarAtendimentosDoProdutor(selectedProdutor.server_id);
      const comFotos = [];
      for (const atendimento of atendimentos) {
        const fotos = await fieldService.listarFotosDoAtendimento(atendimento.local_id, atendimento.server_id);
        comFotos.push({ ...atendimento, fotos_count: fotos.length });
      }
      setAtendimentosLocal(comFotos);
    } else {
      setAtendimentosLocal([]);
    }
  };

  const handleLogin = async () => {
    try {
      const logged = await authService.login(email, senha);
      setUser(logged);
      setStatus('Login realizado');
      if (online) {
        const result = await syncEngine.runFullSync();
        setStatus(`Sincronizado: ${result.pushed} enviados, ${result.pulled} recebidos`);
      }
      await refreshLocal();
    } catch (error) {
      Alert.alert('Falha no login', error.response?.data?.message || error.message || 'Erro inesperado');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setStatus('Sessão encerrada');
  };

  const salvarProdutor = async () => {
    if (!formProdutor.nome.trim()) {
      Alert.alert('Validação', 'Informe o nome do produtor');
      return;
    }
    await fieldService.salvarProdutorLocal(formProdutor);
    setFormProdutor({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      cep: ''
    });
    await refreshLocal();
    setStatus('Produtor salvo no SQLite local');
  };

  const salvarAtendimento = async () => {
    if (!selectedProdutor?.server_id) {
      Alert.alert('Validação', 'Selecione um produtor já sincronizado');
      return;
    }
    const localId = await fieldService.salvarAtendimentoLocal({
      produtor_server_id: Number(selectedProdutor.server_id),
      veiculo_id: formAtendimento.veiculo_id || null,
      km_saida: formAtendimento.km_saida ? Number(formAtendimento.km_saida) : null,
      km_chegada: formAtendimento.km_chegada ? Number(formAtendimento.km_chegada) : null,
      km_percorrido: formAtendimento.km_percorrido ? Number(formAtendimento.km_percorrido) : null,
      data_atendimento: formAtendimento.data_atendimento || null,
      motivo: formAtendimento.motivo || null,
      observacoes: formAtendimento.observacoes || null,
      recomendacoes: formAtendimento.recomendacoes || null,
      latitude: formAtendimento.latitude ? Number(formAtendimento.latitude) : null,
      longitude: formAtendimento.longitude ? Number(formAtendimento.longitude) : null
    });
    setLastAtendimentoLocalId(localId);
    setFormAtendimento({
      produtor_server_id: String(selectedProdutor.server_id),
      veiculo_id: '',
      km_saida: '',
      km_chegada: '',
      km_percorrido: '',
      data_atendimento: '',
      motivo: '',
      observacoes: '',
      recomendacoes: '',
      latitude: '',
      longitude: ''
    });
    setSelectedVeiculo(null);
    setStatus('Atendimento salvo localmente');
    await refreshLocal();
  };

  const anexarFoto = async () => {
    if (!lastAtendimentoLocalId) {
      Alert.alert('Validação', 'Salve um atendimento offline antes de capturar foto');
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão', 'Permissão da câmera não concedida');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });
    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }
    await fieldService.salvarFotoAtendimentoLocal({
      atendimento_server_id: null,
      atendimento_local_id: lastAtendimentoLocalId,
      arquivo_uri: result.assets[0].uri
    });
    setStatus('Foto adicionada na fila offline');
  };

  const obterLocalizacao = async () => {
    try {
      setStatus('Obtendo localização...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão de localização é necessária para registrar coordenadas.');
        setStatus('Permissão de localização negada');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormAtendimento((prev) => ({
        ...prev,
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude)
      }));
      setStatus('Localização obtida com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização: ' + error.message);
      setStatus('Erro ao obter localização');
    }
  };

  const sincronizarAgora = async () => {
    if (!user) {
      Alert.alert('Atenção', 'Faça login antes da sincronização');
      return;
    }
    try {
      const result = await syncEngine.runFullSync();
      setStatus(`Sincronizado: ${result.pushed} enviados, ${result.pulled} recebidos`);
      await refreshLocal();
    } catch (error) {
      setStatus(error.response?.data?.message || error.message || 'Erro na sincronização manual');
    }
  };

  const selecionarProdutor = async (produtor) => {
    setSelectedProdutor(produtor);
    setFormAtendimento((prev) => ({ ...prev, produtor_server_id: produtor.server_id ? String(produtor.server_id) : '' }));
    if (!produtor.server_id) {
      setAtendimentosLocal([]);
      return;
    }
    const atendimentos = await fieldService.listarAtendimentosDoProdutor(produtor.server_id);
    const comFotos = [];
    for (const atendimento of atendimentos) {
      const fotos = await fieldService.listarFotosDoAtendimento(atendimento.local_id, atendimento.server_id);
      comFotos.push({ ...atendimento, fotos_count: fotos.length });
    }
    setAtendimentosLocal(comFotos);
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>Carregando banco local...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.box}>
          <Text style={styles.title}>SGAF Mobile Offline</Text>
          <View style={styles.row}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{syncLabel}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{user ? user.nome : 'Sem sessão'}</Text>
            </View>
          </View>
          {status ? <Text style={[styles.itemText, { marginTop: 8 }]}>{status}</Text> : null}
        </View>

        {!user ? (
          <View style={styles.box}>
            <Text style={styles.subtitle}>Login</Text>
            <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput placeholder="Senha" style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.box}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={sincronizarAgora}>
                <Text style={styles.buttonText}>Sincronizar Agora</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSecondary} onPress={handleLogout}>
                <Text style={styles.buttonText}>Sair</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.box}>
              <Text style={styles.subtitle}>Novo Produtor Offline</Text>
              <TextInput placeholder="Nome" style={styles.input} value={formProdutor.nome} onChangeText={(v) => setFormProdutor((p) => ({ ...p, nome: v }))} />
              <TextInput placeholder="CPF" style={styles.input} value={formProdutor.cpf} onChangeText={(v) => setFormProdutor((p) => ({ ...p, cpf: v }))} />
              <TextInput placeholder="Telefone" style={styles.input} value={formProdutor.telefone} onChangeText={(v) => setFormProdutor((p) => ({ ...p, telefone: v }))} />
              <TextInput placeholder="Email" style={styles.input} value={formProdutor.email} onChangeText={(v) => setFormProdutor((p) => ({ ...p, email: v }))} />
              <TextInput placeholder="Logradouro" style={styles.input} value={formProdutor.logradouro} onChangeText={(v) => setFormProdutor((p) => ({ ...p, logradouro: v }))} />
              <TouchableOpacity style={styles.button} onPress={salvarProdutor}>
                <Text style={styles.buttonText}>Salvar Local</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.box}>
              <Text style={styles.subtitle}>Novo Atendimento Offline</Text>
              <Text style={styles.itemText}>
                Produtor selecionado: {selectedProdutor ? `${selectedProdutor.nome} (${selectedProdutor.server_id || 'sem server_id'})` : 'nenhum'}
              </Text>

              <Text style={[styles.itemText, { marginTop: 4 }]}>
                Veículo: {selectedVeiculo ? `${selectedVeiculo.modelo} (${selectedVeiculo.placa})` : 'Nenhum'}
              </Text>
              <TouchableOpacity 
                style={[styles.buttonSecondary, { marginTop: 8 }]} 
                onPress={() => setVeiculoModalOpen(true)}
              >
                <Text style={styles.buttonText}>Selecionar Veículo</Text>
              </TouchableOpacity>

              {selectedVeiculo && (
                <View style={styles.row}>
                  <TextInput 
                    placeholder="Km Saída" 
                    style={[styles.input, { flex: 1 }]} 
                    value={String(formAtendimento.km_saida)} 
                    onChangeText={(v) => setFormAtendimento((p) => ({ ...p, km_saida: v }))} 
                    keyboardType="numeric"
                  />
                  <TextInput 
                    placeholder="Km Chegada" 
                    style={[styles.input, { flex: 1 }]} 
                    value={String(formAtendimento.km_chegada)} 
                    onChangeText={(v) => {
                      setFormAtendimento((p) => {
                        const kmChegada = parseFloat(v) || 0;
                        const kmSaida = parseFloat(p.km_saida) || 0;
                        const percorrido = kmChegada > kmSaida ? kmChegada - kmSaida : 0;
                        return { ...p, km_chegada: v, km_percorrido: percorrido };
                      });
                    }} 
                    keyboardType="numeric"
                  />
                </View>
              )}

              <TextInput placeholder="Data (YYYY-MM-DD)" style={styles.input} value={formAtendimento.data_atendimento} onChangeText={(v) => setFormAtendimento((p) => ({ ...p, data_atendimento: v }))} />
              <TextInput placeholder="Motivo" style={styles.input} value={formAtendimento.motivo} onChangeText={(v) => setFormAtendimento((p) => ({ ...p, motivo: v }))} />
              <TextInput placeholder="Observações" style={styles.input} value={formAtendimento.observacoes} onChangeText={(v) => setFormAtendimento((p) => ({ ...p, observacoes: v }))} />
              <TextInput placeholder="Recomendações" style={styles.input} value={formAtendimento.recomendacoes} onChangeText={(v) => setFormAtendimento((p) => ({ ...p, recomendacoes: v }))} />
              
              <View style={styles.row}>
                <TextInput 
                  placeholder="Lat" 
                  style={[styles.input, { flex: 1 }]} 
                  value={formAtendimento.latitude} 
                  onChangeText={(v) => setFormAtendimento((p) => ({ ...p, latitude: v }))} 
                  keyboardType="numeric"
                />
                <TextInput 
                  placeholder="Long" 
                  style={[styles.input, { flex: 1 }]} 
                  value={formAtendimento.longitude} 
                  onChangeText={(v) => setFormAtendimento((p) => ({ ...p, longitude: v }))} 
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity style={styles.buttonSecondary} onPress={obterLocalizacao}>
                <Text style={styles.buttonText}>Obter Localização GPS</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={salvarAtendimento}>
                <Text style={styles.buttonText}>Salvar Atendimento Local</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSecondary} onPress={anexarFoto}>
                <Text style={styles.buttonText}>Capturar Foto Offline</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.box}>
              <Text style={styles.subtitle}>Produtores no SQLite</Text>
              <FlatList
                data={produtores}
                keyExtractor={(item) => item.local_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.item, selectedProdutor?.local_id === item.local_id ? styles.itemSelected : null]}
                    onPress={() => selecionarProdutor(item)}
                  >
                    <Text style={styles.itemTitle}>{item.nome}</Text>
                    <Text style={styles.itemText}>server_id: {item.server_id || '-'}</Text>
                    <Text style={styles.itemText}>status: {item.sync_status}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.box}>
              <Text style={styles.subtitle}>Histórico Local do Produtor</Text>
              {!selectedProdutor?.server_id ? (
                <Text style={styles.itemText}>Selecione produtor sincronizado para visualizar histórico.</Text>
              ) : (
                <FlatList
                  data={atendimentosLocal}
                  keyExtractor={(item) => item.local_id}
                  renderItem={({ item }) => (
                    <View style={styles.item}>
                      <Text style={styles.itemTitle}>{item.data_atendimento || 'Sem data'}</Text>
                      <Text style={styles.itemText}>Motivo: {item.motivo || '-'}</Text>
                      <Text style={styles.itemText}>Fotos locais: {item.fotos_count || 0}</Text>
                      <Text style={styles.itemText}>status: {item.sync_status}</Text>
                    </View>
                  )}
                  ListEmptyComponent={<Text style={styles.itemText}>Sem atendimentos locais.</Text>}
                />
              )}
            </View>

            <View style={styles.box}>
              <Text style={styles.subtitle}>Conflitos de Sincronização</Text>
              <FlatList
                data={conflitosSync}
                keyExtractor={(item) => item.op_id}
                renderItem={({ item }) => (
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>{item.entity} / {item.action}</Text>
                    <Text style={styles.itemText}>Tentativas: {item.retry_count}</Text>
                    <Text style={styles.itemText}>Erro: {item.last_error || '-'}</Text>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.itemText}>Sem conflitos.</Text>}
              />
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={veiculoModalOpen}
        animationType="slide"
        onRequestClose={() => setVeiculoModalOpen(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.box}>
            <Text style={styles.title}>Selecionar Veículo</Text>
            <FlatList
              data={veiculos}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, selectedVeiculo?.id === item.id ? styles.itemSelected : null]}
                  onPress={() => {
                    setSelectedVeiculo(item);
                    setFormAtendimento(prev => ({ 
                      ...prev, 
                      veiculo_id: item.id,
                      km_saida: String(item.odometro_atual || '')
                    }));
                    setVeiculoModalOpen(false);
                  }}
                >
                  <Text style={styles.itemTitle}>{item.modelo}</Text>
                  <Text style={styles.itemText}>{item.placa} - {item.tipo}</Text>
                  <Text style={styles.itemText}>Odômetro: {item.odometro_atual} km</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={[styles.buttonSecondary, { marginTop: 12 }]} 
              onPress={() => {
                setSelectedVeiculo(null);
                setFormAtendimento(prev => ({ ...prev, veiculo_id: '', km_saida: '', km_chegada: '' }));
                setVeiculoModalOpen(false);
              }}
            >
              <Text style={styles.buttonText}>Limpar Seleção</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { marginTop: 8 }]} 
              onPress={() => setVeiculoModalOpen(false)}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
