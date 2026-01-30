import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>LeliConect</h1>

      <p>
        Plataforma para conectar familiares a profissionais. Busque profissionais,
        veja avaliações e troque mensagens com segurança.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <Link to="/login" style={btnSecondaryStyle}>Fazer login</Link>
        <Link to="/signup?role=family" style={btnPrimaryStyle}>Cadastrar como Familiar</Link>
        <Link to="/signup?role=professional" style={btnPrimaryStyle}>Cadastrar como Profissional</Link>
      </div>
    </div>
  );
}

const btnPrimaryStyle = {
  padding: "10px 16px",
  border: "1px solid #111",
  textDecoration: "none",
  color: "#111",
  borderRadius: 8,
};

const btnSecondaryStyle = {
  ...btnPrimaryStyle,
  background: "#111",
  color: "white",
};