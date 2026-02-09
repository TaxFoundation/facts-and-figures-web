import 'styled-components';

declare module 'styled-components' {
	export interface DefaultTheme {
		borderColor: string;
		color: string;
		fontFamilies: {
			RobotoFlex: string;
			RobotoMono: string;
		},
		fontSize: string;
		printSize: string;
		fontWeight: string;
		tfBlue: string;
		tfBlueHighlight: string;
		tfYellowCTA: string;
		tfYellowCTAhover: string;
		white: string;
	}
}