'use client';

import Link from 'next/link';
import Style from './Navbar.module.css';
import { useEffect, useState } from 'react';

function Navbar() {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
  }, []);

  return (
    <nav className={Style.navbar}>
      <div className={Style.navContainer}>
        <h2 className={Style.logo}>Aerocode</h2>
        <ul className={Style.navMenu}>
          <li><Link href="/principal">Início</Link></li>
          <li><Link href="/principal/funcionarios">Funcionários</Link></li>
          <li><Link href="/principal/metricas">Metricas</Link></li>
          {(userRole === 'admin' || userRole === 'tecnico') && (
            <li><Link href="/principal/Aeronave">Aeronaves</Link></li>
          )}
          <li><Link href="/">Sair</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;