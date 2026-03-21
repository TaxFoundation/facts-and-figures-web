import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	override componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error('Table rendering error:', error, info.componentStack);
	}

	override render(): ReactNode {
		if (this.state.hasError) {
			return (
				this.props.fallback ?? (
					<p>
						This table could not be displayed. Please try another table or
						download the Excel file.
					</p>
				)
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
