"""
Seed data for major Indonesian ports.
Covers key ports across all major islands.
"""

INDONESIAN_PORTS = [
    # Java
    {"code": "IDJKT", "name": "Pelabuhan Tanjung Priok", "city": "Jakarta", "province": "DKI Jakarta", "island": "Jawa", "latitude": -6.1045, "longitude": 106.8753, "is_major": True},
    {"code": "IDSUB", "name": "Pelabuhan Tanjung Perak", "city": "Surabaya", "province": "Jawa Timur", "island": "Jawa", "latitude": -7.2019, "longitude": 112.7331, "is_major": True},
    {"code": "IDSEM", "name": "Pelabuhan Tanjung Emas", "city": "Semarang", "province": "Jawa Tengah", "island": "Jawa", "latitude": -6.9599, "longitude": 110.4131, "is_major": True},
    {"code": "IDCIR", "name": "Pelabuhan Cirebon", "city": "Cirebon", "province": "Jawa Barat", "island": "Jawa", "latitude": -6.7134, "longitude": 108.5577, "is_major": False},
    {"code": "IDBTJ", "name": "Pelabuhan Batu Ampar", "city": "Batam", "province": "Kepulauan Riau", "island": "Batam", "latitude": 1.1148, "longitude": 104.0305, "is_major": True},
    {"code": "IDPNK", "name": "Pelabuhan Dwikora", "city": "Pontianak", "province": "Kalimantan Barat", "island": "Kalimantan", "latitude": -0.0264, "longitude": 109.3425, "is_major": True},
    # Kalimantan
    {"code": "IDBPN", "name": "Pelabuhan Semayang", "city": "Balikpapan", "province": "Kalimantan Timur", "island": "Kalimantan", "latitude": -1.2654, "longitude": 116.8312, "is_major": True},
    {"code": "IDSRI", "name": "Pelabuhan Samarinda", "city": "Samarinda", "province": "Kalimantan Timur", "island": "Kalimantan", "latitude": -0.4948, "longitude": 117.1436, "is_major": True},
    {"code": "IDBAN", "name": "Pelabuhan Trisakti", "city": "Banjarmasin", "province": "Kalimantan Selatan", "island": "Kalimantan", "latitude": -3.3186, "longitude": 114.5907, "is_major": True},
    {"code": "IDPGK", "name": "Pelabuhan Pangkalan Bun", "city": "Pangkalan Bun", "province": "Kalimantan Tengah", "island": "Kalimantan", "latitude": -2.6833, "longitude": 111.6167, "is_major": False},
    {"code": "IDKUN", "name": "Pelabuhan Tarakan", "city": "Tarakan", "province": "Kalimantan Utara", "island": "Kalimantan", "latitude": 3.3002, "longitude": 117.5784, "is_major": False},
    # Sulawesi
    {"code": "IDMAK", "name": "Pelabuhan Makassar", "city": "Makassar", "province": "Sulawesi Selatan", "island": "Sulawesi", "latitude": -5.1477, "longitude": 119.4327, "is_major": True},
    {"code": "IDBTU", "name": "Pelabuhan Bitung", "city": "Bitung", "province": "Sulawesi Utara", "island": "Sulawesi", "latitude": 1.4398, "longitude": 125.1898, "is_major": True},
    {"code": "IDKDI", "name": "Pelabuhan Kendari", "city": "Kendari", "province": "Sulawesi Tenggara", "island": "Sulawesi", "latitude": -3.9718, "longitude": 122.5127, "is_major": False},
    {"code": "IDPAL", "name": "Pelabuhan Pantoloan", "city": "Palu", "province": "Sulawesi Tengah", "island": "Sulawesi", "latitude": -0.7123, "longitude": 119.8654, "is_major": False},
    # Sumatera
    {"code": "IDMDN", "name": "Pelabuhan Belawan", "city": "Medan", "province": "Sumatera Utara", "island": "Sumatera", "latitude": 3.7936, "longitude": 98.6936, "is_major": True},
    {"code": "IDPKU", "name": "Pelabuhan Pekanbaru", "city": "Pekanbaru", "province": "Riau", "island": "Sumatera", "latitude": 0.5226, "longitude": 101.4476, "is_major": False},
    {"code": "IDPLM", "name": "Pelabuhan Boom Baru", "city": "Palembang", "province": "Sumatera Selatan", "island": "Sumatera", "latitude": -2.9878, "longitude": 104.7754, "is_major": True},
    {"code": "IDBKL", "name": "Pelabuhan Pulau Baai", "city": "Bengkulu", "province": "Bengkulu", "island": "Sumatera", "latitude": -3.8667, "longitude": 102.2833, "is_major": False},
    {"code": "IDBTM", "name": "Pelabuhan Teluk Bayur", "city": "Padang", "province": "Sumatera Barat", "island": "Sumatera", "latitude": -1.0082, "longitude": 100.3604, "is_major": True},
    {"code": "IDLSM", "name": "Pelabuhan Lhokseumawe", "city": "Lhokseumawe", "province": "Aceh", "island": "Sumatera", "latitude": 5.1800, "longitude": 97.1500, "is_major": False},
    {"code": "IDDPK", "name": "Pelabuhan Dumai", "city": "Dumai", "province": "Riau", "island": "Sumatera", "latitude": 1.6751, "longitude": 101.4505, "is_major": True},
    # Bali & Nusa Tenggara
    {"code": "IDDEN", "name": "Pelabuhan Benoa", "city": "Denpasar", "province": "Bali", "island": "Bali", "latitude": -8.7507, "longitude": 115.2153, "is_major": True},
    {"code": "IDMTM", "name": "Pelabuhan Lembar", "city": "Mataram", "province": "Nusa Tenggara Barat", "island": "Lombok", "latitude": -8.7293, "longitude": 116.0730, "is_major": False},
    {"code": "IDKUP", "name": "Pelabuhan Tenau", "city": "Kupang", "province": "Nusa Tenggara Timur", "island": "Timor", "latitude": -10.1675, "longitude": 123.5810, "is_major": True},
    {"code": "IDWAI", "name": "Pelabuhan Waingapu", "city": "Waingapu", "province": "Nusa Tenggara Timur", "island": "Sumba", "latitude": -9.6582, "longitude": 120.2520, "is_major": False},
    # Maluku
    {"code": "IDAMB", "name": "Pelabuhan Ambon", "city": "Ambon", "province": "Maluku", "island": "Ambon", "latitude": -3.6885, "longitude": 128.1824, "is_major": True},
    {"code": "IDSOR", "name": "Pelabuhan Sorong", "city": "Sorong", "province": "Papua Barat Daya", "island": "Papua", "latitude": -0.8762, "longitude": 131.2552, "is_major": True},
    {"code": "IDTER", "name": "Pelabuhan Ternate", "city": "Ternate", "province": "Maluku Utara", "island": "Ternate", "latitude": 0.7893, "longitude": 127.3773, "is_major": False},
    # Papua
    {"code": "IDJAY", "name": "Pelabuhan Jayapura", "city": "Jayapura", "province": "Papua", "island": "Papua", "latitude": -2.5271, "longitude": 140.7218, "is_major": True},
    {"code": "IDMIM", "name": "Pelabuhan Merauke", "city": "Merauke", "province": "Papua Selatan", "island": "Papua", "latitude": -8.4667, "longitude": 140.3333, "is_major": False},
    {"code": "IDMNK", "name": "Pelabuhan Manokwari", "city": "Manokwari", "province": "Papua Barat", "island": "Papua", "latitude": -0.8620, "longitude": 134.0857, "is_major": False},
    # Additional key ports
    {"code": "IDPBE", "name": "Pelabuhan Pangkal Balam", "city": "Pangkalpinang", "province": "Kepulauan Bangka Belitung", "island": "Bangka", "latitude": -2.1000, "longitude": 106.1167, "is_major": False},
    {"code": "IDTJQ", "name": "Pelabuhan Tanjung Pandan", "city": "Tanjung Pandan", "province": "Kepulauan Bangka Belitung", "island": "Belitung", "latitude": -2.7569, "longitude": 107.7553, "is_major": False},
    {"code": "IDKJT", "name": "Pelabuhan Kotabaru", "city": "Kotabaru", "province": "Kalimantan Selatan", "island": "Kalimantan", "latitude": -3.2833, "longitude": 116.2167, "is_major": False},
    {"code": "IDPJG", "name": "Pelabuhan Probolinggo", "city": "Probolinggo", "province": "Jawa Timur", "island": "Jawa", "latitude": -7.7500, "longitude": 113.2167, "is_major": False},
    {"code": "IDKLK", "name": "Pelabuhan Kalabahi", "city": "Kalabahi", "province": "Nusa Tenggara Timur", "island": "Alor", "latitude": -8.2167, "longitude": 124.5167, "is_major": False},
    {"code": "IDGTO", "name": "Pelabuhan Gorontalo", "city": "Gorontalo", "province": "Gorontalo", "island": "Sulawesi", "latitude": 0.5333, "longitude": 123.0667, "is_major": False},
    {"code": "IDMMU", "name": "Pelabuhan Mamuju", "city": "Mamuju", "province": "Sulawesi Barat", "island": "Sulawesi", "latitude": -2.6833, "longitude": 118.8833, "is_major": False},
    {"code": "IDPPO", "name": "Pelabuhan Pare-Pare", "city": "Pare-Pare", "province": "Sulawesi Selatan", "island": "Sulawesi", "latitude": -4.0167, "longitude": 119.6167, "is_major": False},
    {"code": "IDBAU", "name": "Pelabuhan Bau-Bau", "city": "Bau-Bau", "province": "Sulawesi Tenggara", "island": "Sulawesi", "latitude": -5.4667, "longitude": 122.6167, "is_major": False},
    {"code": "IDPAS", "name": "Pelabuhan Pasuruan", "city": "Pasuruan", "province": "Jawa Timur", "island": "Jawa", "latitude": -7.6500, "longitude": 112.9167, "is_major": False},
    {"code": "IDGRS", "name": "Pelabuhan Gresik", "city": "Gresik", "province": "Jawa Timur", "island": "Jawa", "latitude": -7.1667, "longitude": 112.6500, "is_major": False},
    {"code": "IDMJK", "name": "Pelabuhan Merak", "city": "Cilegon", "province": "Banten", "island": "Jawa", "latitude": -5.9333, "longitude": 105.9833, "is_major": True},
    {"code": "IDPJU", "name": "Pelabuhan Panjang", "city": "Bandar Lampung", "province": "Lampung", "island": "Sumatera", "latitude": -5.4531, "longitude": 105.3028, "is_major": True},
    {"code": "IDTLS", "name": "Pelabuhan Teluk Semangka", "city": "Tanggamus", "province": "Lampung", "island": "Sumatera", "latitude": -5.4667, "longitude": 104.6167, "is_major": False},
    {"code": "IDNAB", "name": "Pelabuhan Nabire", "city": "Nabire", "province": "Papua Tengah", "island": "Papua", "latitude": -3.3667, "longitude": 135.5000, "is_major": False},
    {"code": "IDFAK", "name": "Pelabuhan Fakfak", "city": "Fakfak", "province": "Papua Barat", "island": "Papua", "latitude": -2.9167, "longitude": 132.3000, "is_major": False},
    {"code": "IDMBS", "name": "Pelabuhan Maumere", "city": "Maumere", "province": "Nusa Tenggara Timur", "island": "Flores", "latitude": -8.6167, "longitude": 122.2000, "is_major": False},
]
