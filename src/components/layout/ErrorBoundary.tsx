import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro não tratado na aplicação:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-nightwood-950 p-6 text-center text-parchment-100">
          <AlertTriangle className="h-12 w-12 text-ember-500" aria-hidden="true" />
          <h1 className="font-display text-2xl">Algo saiu dos trilhos...</h1>
          <p className="max-w-md font-serif text-parchment-200/80">
            {this.state.message ?? "Ocorreu um erro inesperado na aplicação."}
          </p>
          <button className="btn-primary" onClick={this.handleReload}>
            Voltar à biblioteca
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
