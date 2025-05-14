import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan - Layar18',
  description: 'Syarat dan ketentuan penggunaan platform streaming video dewasa Layar18.',
}

export default function SyaratKetentuanPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10 px-4 sm:px-6 lg:px-8">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-foreground border-b pb-4">
          Syarat & Ketentuan Penggunaan
        </h1>

        <p className="text-sm text-muted-foreground">
          Tanggal Efektif: [Tanggal Hari Ini atau Tanggal Peluncuran Situs]
        </p>

        <p>
          Selamat datang di Layar18 (selanjutnya disebut &quot;Platform&quot;, &quot;Kami&quot;,
          &quot;Kita&quot;, atau &quot;Milik Kami&quot;). Syarat dan Ketentuan Penggunaan ini
          (selanjutnya disebut &quot;Syarat&quot;) mengatur akses Anda ke dan penggunaan Platform
          kami serta layanan terkait. Dengan mengakses atau menggunakan Platform kami, Anda setuju
          untuk terikat oleh Syarat ini. Jika Anda tidak setuju dengan bagian mana pun dari Syarat
          ini, Anda tidak boleh menggunakan Platform kami.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Penerimaan Syarat</h2>
        <p>
          Dengan menggunakan Platform ini, Anda menyatakan bahwa Anda telah membaca, memahami, dan
          setuju untuk terikat oleh Syarat ini dan Kebijakan Privasi kami. Kami dapat mengubah
          Syarat ini dari waktu ke waktu, dan penggunaan Anda yang berkelanjutan setelah perubahan
          tersebut merupakan penerimaan Anda terhadap Syarat yang baru.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Batasan Usia & Kelayakan</h2>
        <p>
          Platform ini ditujukan secara eksklusif untuk individu yang berusia 18 tahun atau lebih,
          atau usia dewasa yang sah di yurisdiksi tempat tinggal Anda, mana saja yang lebih tinggi.
          Dengan mengakses Platform, Anda menyatakan dan menjamin bahwa Anda memenuhi persyaratan
          usia ini. Kami tidak secara sadar mengumpulkan informasi dari individu di bawah usia yang
          disyaratkan.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Penggunaan Platform</h2>
        <ul>
          <li>
            Anda setuju untuk menggunakan Platform hanya untuk tujuan yang sah dan sesuai dengan
            semua hukum dan peraturan yang berlaku.
          </li>
          <li>
            Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda (jika berlaku) dan
            untuk semua aktivitas yang terjadi di bawah akun Anda.
          </li>
          <li>
            Anda tidak boleh menggunakan Platform dengan cara apa pun yang dapat merusak,
            menonaktifkan, membebani secara berlebihan, atau mengganggu Platform atau mengganggu
            penggunaan dan kenikmatan pihak lain atas Platform.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Konten Pihak Ketiga & Penafian</h2>
        <p>
          Platform Layar18 menyediakan akses ke konten video dewasa. Anda memahami dan mengakui
          bahwa Layar18 berfungsi sebagai platform agregator dan distributor dan{' '}
          <strong>tidak memproduksi semua konten video yang tersedia di situs ini.</strong> Konten
          dapat berasal dari berbagai produsen dan penyedia pihak ketiga. Meskipun kami berusaha
          untuk menjaga standar kualitas, kami tidak membuat pernyataan atau jaminan mengenai
          keakuratan, kelengkapan, kesesuaian, atau legalitas konten pihak ketiga mana pun.
        </p>
        <p>
          Pandangan dan pendapat yang diungkapkan dalam konten video adalah milik pembuatnya dan
          tidak selalu mencerminkan pandangan Layar18.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Hak Kekayaan Intelektual</h2>
        <p>
          Konten di Platform ini, termasuk namun tidak terbatas pada teks, grafik, logo, ikon,
          gambar, klip audio, klip video, dan perangkat lunak, adalah milik Layar18 atau pemberi
          lisensinya dan dilindungi oleh undang-undang hak cipta dan kekayaan intelektual lainnya.
          Anda tidak boleh mereproduksi, mendistribusikan, memodifikasi, membuat karya turunan,
          menampilkan secara publik, melakukan secara publik, menerbitkan ulang, mengunduh,
          menyimpan, atau mengirimkan materi apa pun di Platform kami tanpa izin tertulis sebelumnya
          dari kami atau pemilik hak cipta yang relevan.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Tautan ke Situs Pihak Ketiga</h2>
        <p>
          Platform kami mungkin berisi tautan ke situs web atau layanan pihak ketiga yang tidak
          dimiliki atau dikendalikan oleh Layar18. Kami tidak memiliki kendali atas, dan tidak
          bertanggung jawab atas, konten, kebijakan privasi, atau praktik situs web atau layanan
          pihak ketiga mana pun. Anda selanjutnya mengakui dan setuju bahwa Layar18 tidak akan
          bertanggung jawab atau berkewajiban, secara langsung maupun tidak langsung, atas kerusakan
          atau kerugian yang disebabkan atau diduga disebabkan oleh atau sehubungan dengan
          penggunaan atau ketergantungan pada konten, barang, atau layanan tersebut yang tersedia di
          atau melalui situs web atau layanan tersebut.
        </p>
      </article>
    </div>
  )
}
