/* Zeka Küpleri - Öğren dersleri.
   Her adım: t (başlık), txt (anlatım), alg (hamleler, isteğe bağlı), rep (tekrar sayısı).
   Alıştırma durumu, çözülmüş küpe algoritmanın TERSİNİ uygulayarak kurulur; yani algoritmayı
   doğru sayıda uygulayınca küp çözülür. Ders küpünde sarı üstte, beyaz altta durur. */
(function (root) {
  var NOT = "Her harf bir yüzdür: <b>R</b> sağ, <b>L</b> sol, <b>U</b> üst, <b>D</b> alt, <b>F</b> ön, <b>B</b> arka. Harf tek başına ise o yüzü karşıdan bakınca <b>saat yönünde</b> çeyrek tur çevir.";
  var L3 = [
    { t: "Hamle harfleri: R", alg: "R", txt: NOT + " Şimdi sağ yüzü (<b>R</b>) saat yönünde çevir: sağ yüzü yukarı doğru sürükle." },
    { t: "Ters hamle: U'", alg: "U'", txt: "Harfin yanındaki <b>'</b> işareti ters yön demek: <b>U'</b> üst yüzü saat yönünün tersine çevirir. Üst yüzü sola doğru sürükle." },
    { t: "Çift hamle: F2", alg: "F2", txt: "<b>2</b> yarım tur demek: <b>F2</b> ön yüzü iki çeyrek tur çevirir. Yönü fark etmez." },
    { t: "1. Beyaz çarpı: kenarı indir", alg: "F2", txt: "Önce <b>alt yüzde beyaz çarpı</b> yapacağız: dört beyaz kenar parçası, yanlarındaki renkler kendi merkezleriyle eşleşecek şekilde altta dizilir. Beyaz kenar üst katmanda, yan rengi doğru merkezin üstündeyse, o yüzü <b>2 kez</b> çevirerek aşağı indir." },
    { t: "1. Beyaz çarpı: kenarı yan yüzden al", alg: "U R' F R", txt: "Kenar yan yüzde yanlış yerdeyse önce üst yüzü çevirip boşluk aç, sonra kenarı sağ yüzle ön yüze taşıyıp yerine oturt. Bu kısa sıra bir örnek: <b>U R' F R</b>." },
    { t: "2. Beyaz köşeler (1 tekrar)", alg: "R U R' U'", txt: "Şimdi alt katmanın dört köşesi. Beyaz köşeyi yerleşeceği yerin <b>hemen üstüne</b> getir ve <b>R U R' U'</b> kombinasyonunu uygula. Parça oturana kadar tekrar edebilirsin (1, 3 ya da 5 kez)." },
    { t: "2. Beyaz köşeler (3 tekrar)", alg: "R U R' U'", rep: 3, txt: "Bazen köşe 3 tekrardan sonra oturur. Aynı kombinasyonu <b>3 kez</b> arka arkaya uygula." },
    { t: "2. Beyaz köşeler (5 tekrar)", alg: "R U R' U'", rep: 5, txt: "Beyaz renk yukarı bakıyorsa genelde 5 tekrar gerekir. Aynı kombinasyonu <b>5 kez</b> uygula; küp çözülür." },
    { t: "3. Orta katman: sağa", alg: "U R U' R' U' F' U F", txt: "Üstteki kenar parçasında <b>sarı renk yoksa</b> orta katmana inebilir. Ön yüzdeki rengiyle ön merkezi eşleştir. Parça sağa gidecekse: <b>U R U' R' U' F' U F</b>." },
    { t: "3. Orta katman: sola", alg: "U' L' U L U F U' F'", txt: "Parça sola gidecekse aynadaki görüntüsünü uygula: <b>U' L' U L U F U' F'</b>." },
    { t: "4. Sarı çarpı", alg: "F R U R' U' F'", txt: "Üst yüzde sarı bir <b>çarpı</b> yap. Yalnızca nokta, L şekli ya da çizgi görürsen <b>F R U R' U' F'</b> uygula; çarpı oluşana kadar tekrarla. (L şeklinde 2, çizgide 1 kez; çizgi yataysa önce yatay tut.)" },
    { t: "4. Sarı çarpı: L şekli", alg: "F R U R' U' F'", rep: 2, txt: "L şeklinde (köşede iki sarı kenar) aynı kombinasyonu <b>2 kez</b> uygula." },
    { t: "5. Sarı yüzü tamamla", alg: "R U R' U R U2 R'", txt: "Üst yüzdeki sarı köşeleri çevir: <b>R U R' U R U2 R'</b> (balık). Üstte sarı köşe sayısına göre ve küpü döndürerek, tüm sarı yüzey gelene kadar tekrarla." },
    { t: "6. Köşeleri yerine oturt", alg: "U R U' L' U R' U' L", txt: "Her üst köşenin yan renkleri ile ilgili yan merkezler uyuşmalı. Doğru yerdeki bir köşeyi sağ-arkaya koyup <b>U R U' L' U R' U' L</b> uygula; köşeler yer değiştirir." },
    { t: "7. Son kenarlar", alg: "R U' R U R U R U' R' U' R2", txt: "Son adım: üst kenarları döndürerek yerine koy: <b>R U' R U R U R U' R' U' R2</b>. Gerekirse bir kez daha uygula; küp çözülür." }
  ];
  var L2 = [
    { t: "Hamle harfleri: R", alg: "R", txt: NOT + " 2×2 küpte iki katman vardır; sağ yüzü (<b>R</b>) saat yönünde çevir." },
    { t: "Ters ve çift hamle", alg: "U' F2", txt: "<b>'</b> ters yön, <b>2</b> yarım tur demek. Sırayla: <b>U'</b> sonra <b>F2</b>." },
    { t: "1. Alt katman (1 tekrar)", alg: "R U R' U'", txt: "2×2'de merkez yok; renkler küpün köşeleriyle belirlenir. Önce beyaz yüzü alta alıp dört beyaz köşeyi yerleştir. Köşeyi yerleşeceği yerin üstüne getir ve <b>R U R' U'</b> uygula." },
    { t: "1. Alt katman (3 tekrar)", alg: "R U R' U'", rep: 3, txt: "Köşe 3 tekrarda oturabilir: <b>R U R' U'</b> kombinasyonunu 3 kez uygula." },
    { t: "1. Alt katman (5 tekrar)", alg: "R U R' U'", rep: 5, txt: "Bazı durumlarda 5 tekrar gerekir." },
    { t: "2. Üst yüzü sarıya çevir", alg: "R U R' U R U2 R'", txt: "Üst yüzün tamamını sarı yap: <b>R U R' U R U2 R'</b>. Sarı köşe sayısına göre küpü döndürüp tekrarla." },
    { t: "3. Üst köşeleri yerleştir", alg: "U R U' L' U R' U' L", txt: "Yan renkleri uyuşan iki köşe yan yana gelene kadar üstü çevir, sonra <b>U R U' L' U R' U' L</b> uygula." }
  ];
  var LB = [
    { t: "Büyük küpler: genel plan", txt: "4×4 ve daha büyük küplerde çözüm <b>indirgeme</b> yöntemiyle yapılır: büyük küpü önce 3×3 gibi davranacak hale getirirsin. Sıra: <b>1) merkezler</b>, <b>2) kenar çiftleri</b>, <b>3) 3×3 gibi çöz</b>, <b>4) parite düzelt</b>." },
    { t: "1. Merkezleri yap", txt: "Her yüzün ortasındaki kare gruplarını tek renkte topla. 4×4'te her yüzün 4 merkezi vardır. Merkezlerin göreli yerleri değişmez: beyazın karşısı sarı, yeşilin karşısı mavi, kırmızının karşısı turuncudur. İç katmanları çevirerek aynı renkleri bir yüzde birleştir." },
    { t: "2. Kenar çiftleri", txt: "Aynı iki rengi taşıyan kenar parçalarını (4×4'te 2'şer, 5×5'te 3'er) yan yana getirip çiftle. İç katmanı çevirip bir kenar çiftini alta indirerek birleştir, sonra iç katmanı geri çevir. 12 kenarın hepsi çiftlendiğinde küp 3×3 gibi görünür." },
    { t: "3. 3×3 gibi çöz", txt: "Merkezler ve kenarlar birleştikten sonra yalnızca dış katmanları çevirerek küpü 3×3 gibi çöz. Bunun için <b>3×3 Klasik</b> küpün Öğren bölümüne bak." },
    { t: "4×4 paritesi: kenar çevrilmiş", alg: "r2 B2 U2 l U2 r' U2 r U2 F2 r F2 l' B2 r2", only: 4, txt: "4×4'te sonda tek bir kenarın ters durduğunu görebilirsin (3×3'te olmaz). Küçük harfli hamleler iki katmanı birlikte çevirir. Düzeltmek için: <b>r2 B2 U2 l U2 r' U2 r U2 F2 r F2 l' B2 r2</b>." },
    { t: "4×4 paritesi: iki kenar yer değişmiş", alg: "r2 U2 r2 u2 r2 u2", only: 4, txt: "Sonda iki kenar yer değiştirmişse: <b>r2 U2 r2 u2 r2 u2</b>. Sonra küpü 3×3 gibi bitir." },
    { t: "Pariteler (5×5 ve 7×7)", only: 5, txt: "Tek sayılı büyük küplerde (5×5, 7×7) sabit bir merkez parçası vardır; bu yüzden parite sorunu çıkmaz. Merkezleri, kenar çiftlerini ve 3×3 aşamasını yapmak yeter." },
    { t: "Pariteler (6×6)", only: 6, txt: "6×6'da 4×4 pariteleri çıkabilir, ancak düzeltme algoritmaları daha çok katman gerektirir (3 katmanlı geniş hamleler). Önce merkez ve kenarları bitir; parite çıkarsa küp çözülemez değildir, sadece daha uzun algoritma gerekir." }
  ];
  root.ZKLessons = function (n) {
    if (n === 2) return L2;
    if (n === 3) return L3;
    return LB.filter(function (s) { return !s.only || s.only === n || (s.only === 5 && n % 2 === 1) || (s.only === 6 && n === 6); });
  };
})(window);
