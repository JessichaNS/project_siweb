"use client";

import styles from './dash.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [fleetLink, setFleetLink] = useState("/fleet_usr");

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role === "admin") {
      setFleetLink("/fleet_adm");
    } else {
      setFleetLink("/fleet_usr");
    }
  }, []);

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.logoBox}>
          <div className={styles.logo}>
            <img
              src="/shipylogo.jpeg"
              alt="Shipy Logo"
              className={styles.logoImage}
            />
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="dashboard" className={`${styles.navItem} ${styles.active}`}>
            Dashboard
          </Link>

          <Link href={fleetLink} className={styles.navItem}>
            Fleet
          </Link>

          <Link href="#" className={styles.navItem}>
            Map
          </Link>

          <Link href="#" className={styles.navItem}>
            Analytic
          </Link>
        </nav>

        <div className={styles.userBox}>
          <div className={styles.userIcon}>
            <img
              src="/profile.png"
              alt="User"
              className={styles.userImage}
            />
          </div>
        </div>
      </header>

      <section className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span>Total Vessels</span>
          <strong>6</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Arrived Vessels</span>
          <strong>1</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>En Route Vessels</span>
          <strong>3</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Maintenance</span>
          <strong>1</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Delayed Vessels</span>
          <strong>1</strong>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.cargoCard}>
          <h3>Monthly Cargo in</h3>

          <div className={styles.progressWrap}>
            <div className={styles.progressHeader}>
              <strong>65%</strong>
            </div>

            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>

            <p className={styles.smallText}>
              650/1000
              <br />
              Ton
            </p>
          </div>

          <p className={styles.greenText}>
            65% ↑ +10% from
            <br />
            last month
          </p>
        </div>

        <div className={styles.mapCard}>
          <img
            src="/map siweb.jpeg"
            alt="World Map"
            className={styles.mapImage}
          />
          <div className={`${styles.dot} ${styles.red}`}></div>
          <div className={`${styles.dot} ${styles.green}`}></div>
          <div className={`${styles.dot} ${styles.yellow}`}></div>
          <div className={`${styles.dot} ${styles.blueOne}`}></div>
          <div className={`${styles.dot} ${styles.blueTwo}`}></div>
        </div>

        <div className={styles.statusCard}>
          <h3>Fleet Status Overview</h3>

          <div className={styles.statusBars}>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillBlue}`}></div>
            </div>

            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillGreen}`}></div>
            </div>

            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillYellow}`}></div>
            </div>

            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillRed}`}></div>
            </div>
          </div>

          <div className={styles.legend}>
            <span><i className={styles.legendBlue}></i>En Route</span>
            <span><i className={styles.legendYellow}></i>Delayed</span>
            <span><i className={styles.legendGreen}></i>In Port</span>
            <span><i className={styles.legendRed}></i>Maintenance</span>
          </div>
        </div>

        <div className={styles.fuelCard}>
          <h3>Fuel Consumption</h3>

          <div className={styles.fuelStats}>
            <p className={styles.muted}>Today</p>

            <div className={styles.fuelNumberRow}>
              <h2>48,5</h2>
              <span className={styles.unit}>KL</span>
            </div>

            <p className={styles.mutedSmall}>Total Consumption</p>
          </div>

          <div className={styles.chart}>
            <div className={styles.chartGrid}></div>
            <svg viewBox="0 0 300 160" className={styles.svgChart}>
              <polyline
                fill="none"
                stroke="#5c4bff"
                strokeWidth="3"
                points="10,120 70,72 120,95 170,135 220,84 260,135 290,34"
              />
              <circle cx="10" cy="120" r="4" className={styles.chartPoint} />
              <circle cx="70" cy="72" r="4" className={styles.chartPoint} />
              <circle cx="120" cy="95" r="4" className={styles.chartPoint} />
              <circle cx="170" cy="135" r="4" className={styles.chartPoint} />
              <circle cx="220" cy="84" r="4" className={styles.chartPoint} />
              <circle cx="260" cy="135" r="4" className={styles.chartPoint} />
              <circle cx="290" cy="34" r="4" className={styles.chartPoint} />
            </svg>
          </div>

          <div className={styles.fuelXAxis}>
            <span>00.00</span>
            <span>04.00</span>
            <span>08.00</span>
            <span>12.00</span>
            <span>20.00</span>
            <span>24.00</span>
          </div>
        </div>

        <div className={styles.deliveryCard}>
          <div className={styles.deliveryHeaderRow}>
            <div className={styles.deliveryHeaderLeft}>
              <h3 className={styles.deliveryTitle}>Monthly Delivery Speed</h3>
              <p className={styles.deliverySubtitle}>(Average)</p>

              <div className={styles.deliveryValueRow}>
                <span className={styles.deliveryBigNumber}>28,8</span>
                <span className={styles.deliveryBigUnit}>Knots</span>
              </div>
            </div>

            <div className={styles.deliveryGrowthBox}>
              <div className={styles.deliveryGrowthTop}>↑ 65%</div>
              <div className={styles.deliveryGrowthBottom}>from last month</div>
            </div>
          </div>

          <div className={styles.deliveryChartBox}>
            <div className={styles.deliveryLeftAxis}>
              <span className={styles.deliveryAxisLabel}>Knots</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            <svg viewBox="0 0 620 250" className={styles.deliveryChartSvg}>
              <line x1="80" y1="30" x2="80" y2="210" className={styles.deliveryAxisLine} />
              <line x1="80" y1="210" x2="585" y2="210" className={styles.deliveryAxisLine} />

              <line x1="180" y1="120" x2="180" y2="210" className={styles.deliveryGuideLine} />
              <line x1="300" y1="130" x2="300" y2="210" className={styles.deliveryGuideLine} />
              <line x1="420" y1="88" x2="420" y2="210" className={styles.deliveryGuideLine} />
              <line x1="540" y1="118" x2="540" y2="210" className={styles.deliveryGuideLine} />

              <polyline
                fill="none"
                stroke="#5a46ff"
                strokeWidth="4"
                points="180,120 300,130 420,88 540,118"
              />

              <circle cx="180" cy="120" r="10" className={styles.deliveryPoint} />
              <circle cx="300" cy="130" r="10" className={styles.deliveryPoint} />
              <circle cx="420" cy="88" r="10" className={styles.deliveryPoint} />
              <circle cx="540" cy="118" r="10" className={styles.deliveryPoint} />

              <text x="162" y="95" className={styles.deliveryPointText}>21,6</text>
              <text x="282" y="106" className={styles.deliveryPointText}>19,4</text>
              <text x="402" y="63" className={styles.deliveryPointText}>29,5</text>
              <text x="522" y="94" className={styles.deliveryPointText}>21,8</text>

              <text x="145" y="240" className={styles.deliveryWeekText}>Week 1</text>
              <text x="265" y="240" className={styles.deliveryWeekText}>Week 2</text>
              <text x="385" y="240" className={styles.deliveryWeekText}>Week 3</text>
              <text x="505" y="240" className={styles.deliveryWeekText}>Week 4</text>
            </svg>
          </div>
        </div>

        <div className={styles.alertsCard}>
          <h3>ALERTS</h3>

          <div className={`${styles.alertBox} ${styles.alertRed}`}>
            <div className={styles.alertInner}>
              <div className={styles.alertLeft}>
                <div className={styles.alertIcon}>⚠</div>
                <strong>Engine temperature warning on MV Pasific Star</strong>
              </div>
              <p>3 minutes ago</p>
            </div>
          </div>

          <div className={`${styles.alertBox} ${styles.alertYellow}`}>
            <div className={styles.alertInner}>
              <div className={styles.alertLeft}>
                <div className={styles.alertIcon}>☁</div>
                <strong>Storm warning in Pacific Ocean region</strong>
              </div>
              <p>50 second ago</p>
            </div>
          </div>

          <div className={`${styles.alertBox} ${styles.alertBrown}`}>
            <div className={styles.alertInner}>
              <div className={styles.alertLeft}>
                <div className={styles.alertIcon}>📡</div>
                <strong>Intermittent signal from MV Pasific Star</strong>
              </div>
              <p>10 minutes ago</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}