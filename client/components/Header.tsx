import Image from 'next/image';

export default function Header() {
    return (
        <header className="app-header">
            <div className="container header-wrap">
                <div className="header-left">
                    <Image
                        className="logo"
                        src="/logo.svg"
                        alt="Stryker logo"
                        width={28}
                        height={28}
                    />
                    <span className="v-divider" aria-hidden="true" />
                    <span className="app-title">AI DATA EXTRACTION TOOL</span>
                </div>

                <div className="header-right">
                    <div className="credits" aria-label="Credits">
                        <span className="credits-value">99</span>
                        <span className="credits-label">Credits</span>
                    </div>
                    <button className="user-btn" aria-label="Account & settings">
                        <Image src="/user.png" alt="User logo" width={18} height={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
