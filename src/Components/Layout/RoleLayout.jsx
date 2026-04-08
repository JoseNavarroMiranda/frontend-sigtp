import { AppNavbar } from './Navbar';
import { Footer } from './Footer';


export function RoleLayout({ title, menuItems, children }) {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">

      <AppNavbar title={title} menuItems={menuItems} />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <div className="bg-white rounded-4 shadow-sm border border-light p-4 p-md-5">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
