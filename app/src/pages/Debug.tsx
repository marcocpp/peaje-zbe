import { PageHead } from "../zbe/ui"

export default function Debug() {
	return (
		<PageHead title="Contract Explorer">
			The Contract Explorer is being converted to a standalone Stellar Scaffold
			Extension that runs in its own process. Once available, this page will
			link to it automatically. In the meantime, use the{" "}
			<a href="https://lab.stellar.org" target="_blank" rel="noreferrer">
				Stellar Lab
			</a>{" "}
			to inspect transactions.
		</PageHead>
	)
}
