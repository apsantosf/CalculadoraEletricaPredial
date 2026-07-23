import * as SQLite from "expo-sqlite";

// Abre ou cria o banco de dados local
const db = SQLite.openDatabaseSync("eletricaPredial.db");

export const initDatabase = () => {
  // Cria as tabelas necessárias se ainda não existirem
  db.execSync(`
    CREATE TABLE IF NOT EXISTS projetos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      andares TEXT,
      dados_json TEXT
    );
  `);
};

export const salvarProjetoLocal = (
  nome: string,
  andares: string,
  dados: any,
) => {
  const jsonDados = JSON.stringify(dados);
  db.runSync(
    "INSERT INTO projetos (nome, andares, dados_json) VALUES (?, ?, ?)",
    [nome, andares, jsonDados],
  );
};

export const listarProjetosLocais = () => {
  return db.getAllSync("SELECT * FROM projetos");
};
