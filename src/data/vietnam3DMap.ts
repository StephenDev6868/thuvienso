export type VietnamMapRegion =
  | 'Tất cả'
  | 'Tây Bắc Bộ'
  | 'Đông Bắc Bộ'
  | 'Đồng bằng Bắc Bộ'
  | 'Bắc Trung Bộ'
  | 'Nam Trung Bộ'
  | 'Tây Nguyên'
  | 'Đông Nam Bộ'
  | 'Đồng bằng Sông Cửu Long'

export interface VietnamProvinceFeature {
  id: string
  name: string
  region: Exclude<VietnamMapRegion, 'Tất cả'>
  capital: string
  x: number
  y: number
  color: string
  history: string
  geography: string
  tourism: string[]
  tourismDetails?: VietnamTourismSpot[]
  highlight: string
}

export interface VietnamTourismSpot {
  name: string
  category: 'Biểu tượng' | 'Biển đảo' | 'Sinh thái' | 'Di tích' | 'Bảo tàng' | 'Di sản'
  description: string
  imageUrl: string
  sourceUrl: string
}

export const vietnamMapRegions: VietnamMapRegion[] = [
  'Tất cả',
  'Tây Bắc Bộ',
  'Đông Bắc Bộ',
  'Đồng bằng Bắc Bộ',
  'Bắc Trung Bộ',
  'Nam Trung Bộ',
  'Tây Nguyên',
  'Đông Nam Bộ',
  'Đồng bằng Sông Cửu Long',
]

export const vietnamProvinceFeatures: VietnamProvinceFeature[] = [
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Hà Nội',
    x: 56,
    y: 23,
    color: '#ef4444',
    history:
      'Thủ đô nghìn năm văn hiến, gắn với Thăng Long, Hồ Gươm và nhiều di tích lịch sử quan trọng.',
    geography:
      'Nằm ở trung tâm đồng bằng sông Hồng, là đầu mối giao thông, giáo dục và văn hóa lớn của cả nước.',
    tourism: ['Văn Miếu - Quốc Tử Giám', 'Hồ Gươm', 'Hoàng thành Thăng Long'],
    highlight: 'Thủ đô nghìn năm văn hiến',
  },
  {
    id: 'hue',
    name: 'Huế',
    region: 'Bắc Trung Bộ',
    capital: 'Huế',
    x: 50,
    y: 46,
    color: '#ec4899',
    history:
      'Cố đô của triều Nguyễn, nổi tiếng với nhã nhạc cung đình, lăng tẩm và kiến trúc hoàng cung.',
    geography: 'Nằm bên sông Hương, giữa dải đất miền Trung, có đầm phá, biển và núi đan xen.',
    tourism: ['Đại Nội Huế', 'Lăng Tự Đức', 'Sông Hương'],
    highlight: 'Di sản văn hóa thế giới',
  },
  {
    id: 'hai-phong',
    name: 'Hải Phòng',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Hải Phòng',
    x: 65,
    y: 25,
    color: '#f97316',
    history:
      'Thành phố cảng lâu đời, có vai trò quan trọng trong giao thương và bảo vệ vùng biển phía Bắc.',
    geography: 'Nằm ven vịnh Bắc Bộ, có cảng biển lớn, đảo Cát Bà và nhiều cửa sông.',
    tourism: ['Cát Bà', 'Đồ Sơn', 'Nhà hát lớn Hải Phòng'],
    highlight: 'Thành phố hoa phượng đỏ',
  },
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    region: 'Nam Trung Bộ',
    capital: 'Đà Nẵng',
    x: 50.5,
    y: 46.5,
    color: '#0ea5e9',
    history:
      'Thành phố trẻ năng động, gắn với thương cảng miền Trung và tuyến di sản Huế - Hội An - Mỹ Sơn.',
    geography: 'Nằm giữa miền Trung, có biển, bán đảo Sơn Trà, sông Hàn và đèo Hải Vân.',
    tourism: [
      'Cầu Rồng',
      'Cầu Vàng - Bà Nà Hills',
      'Bán đảo Sơn Trà',
      'Ngũ Hành Sơn',
      'Bảo tàng Điêu khắc Chăm',
      'Biển Mỹ Khê',
      'Phố cổ Hội An',
      'Thánh địa Mỹ Sơn',
    ],
    tourismDetails: [
      {
        name: 'Cầu Rồng',
        category: 'Biểu tượng',
        description:
          'Cây cầu bắc qua sông Hàn, nổi bật với hình rồng vàng và các màn phun lửa, phun nước vào dịp cuối tuần.',
        imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Dragon_Bridge_Da_Nang_4.jpg?width=640',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dragon_Bridge_Da_Nang_4.jpg',
      },
      {
        name: 'Cầu Vàng - Bà Nà Hills',
        category: 'Biểu tượng',
        description:
          'Cầu đi bộ trên núi Bà Nà, nổi tiếng với đôi bàn tay khổng lồ nâng dải cầu vàng giữa mây núi.',
        imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Bridge_(Vietnam)_20190920.jpg?width=640',
        sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Golden_Bridge_(Vietnam)',
      },
      {
        name: 'Chùa Linh Ứng Sơn Trà',
        category: 'Di tích',
        description:
          'Ngôi chùa trên bán đảo Sơn Trà, nhìn ra biển Đà Nẵng, nổi bật với tượng Quan Âm cao lớn.',
        imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Son-Tra-Peninsula_Da-Nang_Vietnam_Linh-Ung-Pagoda-01.jpg?width=640',
        sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Linh_Ung_Pagoda',
      },
      {
        name: 'Ngũ Hành Sơn',
        category: 'Sinh thái',
        description:
          'Quần thể núi đá vôi, hang động và chùa cổ ở phía đông nam thành phố, gắn với làng đá mỹ nghệ Non Nước.',
        imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Da_Nang_-_coastal_view_from_Marble_Mountains_Mar_2024_01.jpg?width=640',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:Da_Nang_-_coastal_view_from_Marble_Mountains_Mar_2024_01.jpg',
      },
      {
        name: 'Bảo tàng Điêu khắc Chăm',
        category: 'Bảo tàng',
        description:
          'Không gian lưu giữ bộ sưu tập hiện vật Chăm Pa quy mô lớn, giúp học sinh hiểu thêm lịch sử miền Trung.',
        imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chammuseum.JPG?width=640',
        sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Museum_of_Cham_Sculpture',
      },
      {
        name: 'Biển Mỹ Khê',
        category: 'Biển đảo',
        description:
          'Bãi biển dài, nước xanh, cát sáng màu, là một hình ảnh rất quen thuộc khi nhắc đến Đà Nẵng.',
        imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Da_Nang_-_coastal_view_from_Marble_Mountains_Mar_2024_01.jpg?width=640',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:Da_Nang_-_coastal_view_from_Marble_Mountains_Mar_2024_01.jpg',
      },
      {
        name: 'Phố cổ Hội An',
        category: 'Di sản',
        description:
          'Không gian đô thị cổ ven sông Hoài, tiêu biểu cho giao thương miền Trung và văn hóa kiến trúc truyền thống.',
        imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Hoi_An,_Vietnam.jpg?width=640',
        sourceUrl: 'https://commons.wikimedia.org/wiki/Category:Hoi_An',
      },
      {
        name: 'Thánh địa Mỹ Sơn',
        category: 'Di sản',
        description:
          'Quần thể đền tháp Chăm Pa trong thung lũng xanh, là điểm học tập nổi bật về lịch sử và kiến trúc cổ.',
        imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/A_far_view_of_the_ruins_at_My_Son_(30992152933).jpg?width=640',
        sourceUrl: 'https://commons.wikimedia.org/wiki/Category:My_Son',
      },
    ],
    highlight: 'Cầu Rồng bên sông Hàn',
  },
  {
    id: 'ho-chi-minh',
    name: 'TP. Hồ Chí Minh',
    region: 'Đông Nam Bộ',
    capital: 'TP. Hồ Chí Minh',
    x: 59,
    y: 76,
    color: '#14b8a6',
    history:
      'Đô thị lớn phương Nam, mang tên Bác Hồ và là nơi lưu giữ nhiều dấu mốc lịch sử hiện đại.',
    geography:
      'Nằm ở vùng chuyển tiếp Đông Nam Bộ - Tây Nam Bộ, kết nối mạnh với sông Sài Gòn và hệ cảng.',
    tourism: ['Dinh Độc Lập', 'Bưu điện Thành phố', 'Chợ Bến Thành'],
    highlight: 'Thành phố mang tên Bác',
  },
  {
    id: 'can-tho',
    name: 'Cần Thơ',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Cần Thơ',
    x: 42,
    y: 84,
    color: '#22c55e',
    history: 'Trung tâm Tây Đô của miền sông nước, nổi bật với văn hóa chợ nổi và miệt vườn.',
    geography: 'Nằm bên sông Hậu, là đô thị trung tâm của đồng bằng sông Cửu Long.',
    tourism: ['Chợ nổi Cái Răng', 'Bến Ninh Kiều', 'Vườn trái cây Phong Điền'],
    highlight: 'Văn hóa miền sông nước',
  },
  {
    id: 'tuyen-quang',
    name: 'Tuyên Quang',
    region: 'Đông Bắc Bộ',
    capital: 'Tuyên Quang',
    x: 47,
    y: 18,
    color: '#16a34a',
    history: 'Vùng căn cứ cách mạng quan trọng, nổi bật với Tân Trào và dấu ấn kháng chiến.',
    geography: 'Có núi, rừng, hồ và thung lũng, nằm giữa trung du miền núi phía Bắc.',
    tourism: ['Khu di tích Tân Trào', 'Hồ Na Hang', 'Thác Mơ'],
    highlight: 'Thủ đô khu giải phóng',
  },
  {
    id: 'cao-bang',
    name: 'Cao Bằng',
    region: 'Đông Bắc Bộ',
    capital: 'Cao Bằng',
    x: 55,
    y: 15,
    color: '#0f766e',
    history:
      'Gắn với Pác Bó, nơi Bác Hồ trở về lãnh đạo cách mạng sau nhiều năm hoạt động ở nước ngoài.',
    geography: 'Tỉnh miền núi biên giới, có địa hình đá vôi, thác nước và hang động đẹp.',
    tourism: ['Thác Bản Giốc', 'Pác Bó', 'Động Ngườm Ngao'],
    highlight: 'Non nước Cao Bằng',
  },
  {
    id: 'lai-chau',
    name: 'Lai Châu',
    region: 'Tây Bắc Bộ',
    capital: 'Lai Châu',
    x: 28,
    y: 17,
    color: '#65a30d',
    history:
      'Vùng đất giàu bản sắc các dân tộc Tây Bắc, lưu giữ nhiều lễ hội và nghề truyền thống.',
    geography:
      'Nhiều núi cao, thung lũng và đèo dốc, có cảnh quan hùng vĩ quanh dãy Hoàng Liên Sơn.',
    tourism: ['Đèo Ô Quy Hồ', 'Pu Ta Leng', 'Sin Suối Hồ'],
    highlight: 'Mây núi Tây Bắc',
  },
  {
    id: 'lao-cai',
    name: 'Lào Cai',
    region: 'Tây Bắc Bộ',
    capital: 'Yên Bái',
    x: 35,
    y: 14,
    color: '#84cc16',
    history: 'Vùng cửa ngõ biên giới phía Bắc, nổi tiếng với Sa Pa và ruộng bậc thang vùng cao.',
    geography: 'Có đỉnh Fansipan, sông Hồng chảy qua và nhiều vùng khí hậu mát mẻ.',
    tourism: ['Sa Pa', 'Fansipan', 'Mù Cang Chải'],
    highlight: 'Nóc nhà Đông Dương',
  },
  {
    id: 'thai-nguyen',
    name: 'Thái Nguyên',
    region: 'Đông Bắc Bộ',
    capital: 'Thái Nguyên',
    x: 54,
    y: 20,
    color: '#059669',
    history: 'Vùng trung du gắn với ATK Định Hóa và truyền thống cách mạng, nổi tiếng văn hóa trà.',
    geography: 'Nằm ở trung du miền núi phía Bắc, có đồi chè, hồ và các dãy núi thấp.',
    tourism: ['Đồi chè Tân Cương', 'Hồ Núi Cốc', 'ATK Định Hóa'],
    highlight: 'Xứ trà trung du',
  },
  {
    id: 'dien-bien',
    name: 'Điện Biên',
    region: 'Tây Bắc Bộ',
    capital: 'Điện Biên Phủ',
    x: 24,
    y: 25,
    color: '#a3e635',
    history:
      'Nơi diễn ra Chiến thắng Điện Biên Phủ năm 1954, một mốc son lớn trong lịch sử Việt Nam.',
    geography: 'Nằm ở cực Tây Bắc, có lòng chảo Điện Biên và nhiều dãy núi bao quanh.',
    tourism: ['Đồi A1', 'Hầm Đờ Cát', 'Cánh đồng Mường Thanh'],
    highlight: 'Điện Biên Phủ lịch sử',
  },
  {
    id: 'lang-son',
    name: 'Lạng Sơn',
    region: 'Đông Bắc Bộ',
    capital: 'Lạng Sơn',
    x: 62,
    y: 18,
    color: '#10b981',
    history: 'Vùng biên ải phía Bắc, gắn với các câu chuyện về Ải Chi Lăng và giao thương lâu đời.',
    geography: 'Có núi đá vôi, cửa khẩu và thung lũng ở vùng Đông Bắc.',
    tourism: ['Động Tam Thanh', 'Ải Chi Lăng', 'Núi Tô Thị'],
    highlight: 'Xứ Lạng biên cương',
  },
  {
    id: 'son-la',
    name: 'Sơn La',
    region: 'Tây Bắc Bộ',
    capital: 'Sơn La',
    x: 33,
    y: 26,
    color: '#4ade80',
    history: 'Vùng đất của nhiều dân tộc Tây Bắc, có di tích Nhà tù Sơn La và văn hóa xòe Thái.',
    geography: 'Địa hình cao nguyên, núi và lòng hồ sông Đà rộng lớn.',
    tourism: ['Mộc Châu', 'Nhà tù Sơn La', 'Lòng hồ sông Đà'],
    highlight: 'Cao nguyên hoa mận',
  },
  {
    id: 'phu-tho',
    name: 'Phú Thọ',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Phú Thọ',
    x: 47,
    y: 23,
    color: '#eab308',
    history: 'Đất Tổ Hùng Vương, nơi gắn với truyền thuyết dựng nước Văn Lang.',
    geography: 'Nằm ở vùng trung du, nơi gặp gỡ của nhiều dòng sông lớn miền Bắc.',
    tourism: ['Đền Hùng', 'Ao Châu', 'Suối khoáng Thanh Thủy'],
    highlight: 'Cội nguồn dân tộc',
  },
  {
    id: 'bac-ninh',
    name: 'Bắc Ninh',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Bắc Ninh',
    x: 60,
    y: 24,
    color: '#f59e0b',
    history: 'Vùng Kinh Bắc cổ, nổi tiếng dân ca quan họ và nhiều làng nghề truyền thống.',
    geography: 'Nằm trong đồng bằng sông Hồng, gần Hà Nội và có mạng lưới sông ngòi dày.',
    tourism: ['Chùa Dâu', 'Làng tranh Đông Hồ', 'Đền Đô'],
    highlight: 'Miền quan họ',
  },
  {
    id: 'quang-ninh',
    name: 'Quảng Ninh',
    region: 'Đông Bắc Bộ',
    capital: 'Hạ Long',
    x: 70,
    y: 27,
    color: '#0284c7',
    history:
      'Vùng mỏ và vùng biển Đông Bắc, có nhiều dấu tích thương cảng, Phật giáo và chiến công Bạch Đằng.',
    geography: 'Có bờ biển dài, đảo, vịnh, núi đá vôi và cửa khẩu quốc tế.',
    tourism: ['Vịnh Hạ Long', 'Yên Tử', 'Cô Tô'],
    highlight: 'Kỳ quan thiên nhiên thế giới',
  },
  {
    id: 'hung-yen',
    name: 'Hưng Yên',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Hưng Yên',
    x: 57,
    y: 28,
    color: '#facc15',
    history: 'Nổi tiếng Phố Hiến xưa, từng là thương cảng nhộn nhịp ở đồng bằng Bắc Bộ.',
    geography: 'Nằm giữa vùng châu thổ sông Hồng, đất đai bằng phẳng, thuận lợi trồng cây ăn quả.',
    tourism: ['Phố Hiến', 'Đền Mẫu', 'Vườn nhãn lồng'],
    highlight: 'Phố Hiến xưa',
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Ninh Bình',
    x: 49,
    y: 32,
    color: '#fb923c',
    history: 'Cố đô Hoa Lư, nơi ghi dấu các triều Đinh, Tiền Lê và buổi đầu nhà Lý.',
    geography: 'Có núi đá vôi, sông nước và đồng bằng ven biển phía Nam châu thổ sông Hồng.',
    tourism: ['Tràng An', 'Tam Cốc', 'Cố đô Hoa Lư'],
    highlight: 'Di sản Tràng An',
  },
  {
    id: 'thanh-hoa',
    name: 'Thanh Hóa',
    region: 'Bắc Trung Bộ',
    capital: 'Thanh Hóa',
    x: 43,
    y: 36,
    color: '#fb7185',
    history: 'Vùng đất địa linh nhân kiệt, gắn với Lam Sơn, nhà Lê và nhiều di tích cổ.',
    geography: 'Có đủ núi, đồng bằng, biển và sông Mã chảy qua.',
    tourism: ['Thành nhà Hồ', 'Suối cá Cẩm Lương', 'Biển Sầm Sơn'],
    highlight: 'Xứ Thanh anh hùng',
  },
  {
    id: 'nghe-an',
    name: 'Nghệ An',
    region: 'Bắc Trung Bộ',
    capital: 'Vinh',
    x: 46,
    y: 40,
    color: '#f43f5e',
    history: 'Quê hương Chủ tịch Hồ Chí Minh, giàu truyền thống hiếu học và yêu nước.',
    geography: 'Diện tích rộng, có miền núi phía Tây, đồng bằng ven biển và sông Lam.',
    tourism: ['Làng Sen', 'Biển Cửa Lò', 'Pù Mát'],
    highlight: 'Quê Bác',
  },
  {
    id: 'ha-tinh',
    name: 'Hà Tĩnh',
    region: 'Bắc Trung Bộ',
    capital: 'Hà Tĩnh',
    x: 48,
    y: 43,
    color: '#e11d48',
    history: 'Vùng đất văn chương, âm nhạc dân gian ví giặm và nhiều truyền thống yêu nước.',
    geography: 'Nằm giữa dãy Trường Sơn và biển Đông, có sông La, núi Hồng và biển đẹp.',
    tourism: ['Ngã ba Đồng Lộc', 'Biển Thiên Cầm', 'Chùa Hương Tích'],
    highlight: 'Ví giặm quê hương',
  },
  {
    id: 'quang-tri',
    name: 'Quảng Trị',
    region: 'Bắc Trung Bộ',
    capital: 'Đông Hà',
    x: 50,
    y: 46,
    color: '#dc2626',
    history:
      'Vùng đất nhiều dấu tích chiến tranh, nổi bật với Thành cổ Quảng Trị và cầu Hiền Lương.',
    geography: 'Nằm ở miền Trung, có biển, đồng bằng hẹp, đồi núi và tuyến hành lang Đông - Tây.',
    tourism: ['Thành cổ Quảng Trị', 'Cầu Hiền Lương', 'Địa đạo Vịnh Mốc'],
    highlight: 'Miền ký ức lịch sử',
  },
  {
    id: 'quang-ngai',
    name: 'Quảng Ngãi',
    region: 'Nam Trung Bộ',
    capital: 'Quảng Ngãi',
    x: 58,
    y: 57,
    color: '#f97316',
    history: 'Vùng đất miền Trung giàu truyền thống, gắn với văn hóa Sa Huỳnh và đảo Lý Sơn.',
    geography: 'Có biển, đảo, đồng bằng ven sông Trà Khúc và vùng núi phía Tây.',
    tourism: ['Lý Sơn', 'Mỹ Khê', 'Núi Thiên Ấn'],
    highlight: 'Đảo núi lửa Lý Sơn',
  },
  {
    id: 'gia-lai',
    name: 'Gia Lai',
    region: 'Tây Nguyên',
    capital: 'Pleiku',
    x: 50,
    y: 62,
    color: '#8b5cf6',
    history: 'Không gian văn hóa cồng chiêng Tây Nguyên, giàu bản sắc các dân tộc Ba Na, Jrai.',
    geography: 'Cao nguyên rộng, có núi lửa cổ, hồ, rừng và khí hậu mát.',
    tourism: ['Biển Hồ', 'Núi lửa Chư Đăng Ya', 'Quảng trường Đại Đoàn Kết'],
    highlight: 'Phố núi Pleiku',
  },
  {
    id: 'khanh-hoa',
    name: 'Khánh Hòa',
    region: 'Nam Trung Bộ',
    capital: 'Nha Trang',
    x: 64,
    y: 67,
    color: '#06b6d4',
    history: 'Vùng duyên hải có dấu ấn Chăm Pa, tháp cổ và văn hóa biển đảo lâu đời.',
    geography: 'Nằm ven biển Nam Trung Bộ, có vịnh, đảo, đầm và bãi biển đẹp.',
    tourism: ['Nha Trang', 'Tháp Bà Ponagar', 'Vịnh Vân Phong'],
    highlight: 'Biển xanh Nha Trang',
  },
  {
    id: 'lam-dong',
    name: 'Lâm Đồng',
    region: 'Tây Nguyên',
    capital: 'Đà Lạt',
    x: 51,
    y: 70,
    color: '#7c3aed',
    history:
      'Vùng cao nguyên nổi tiếng với Đà Lạt, kiến trúc nghỉ dưỡng và văn hóa các dân tộc bản địa.',
    geography: 'Nằm trên cao nguyên, khí hậu mát, nhiều thác, hồ và rừng thông.',
    tourism: ['Đà Lạt', 'Thác Datanla', 'Hồ Xuân Hương'],
    highlight: 'Thành phố ngàn hoa',
  },
  {
    id: 'dak-lak',
    name: 'Đắk Lắk',
    region: 'Tây Nguyên',
    capital: 'Buôn Ma Thuột',
    x: 48,
    y: 67,
    color: '#9333ea',
    history: 'Trung tâm văn hóa Tây Nguyên, nổi tiếng với sử thi, nhà dài và lễ hội cà phê.',
    geography: 'Cao nguyên bazan rộng lớn, nhiều rừng, hồ và thác nước.',
    tourism: ['Buôn Đôn', 'Thác Dray Nur', 'Hồ Lắk'],
    highlight: 'Thủ phủ cà phê',
  },
  {
    id: 'dong-nai',
    name: 'Đồng Nai',
    region: 'Đông Nam Bộ',
    capital: 'Biên Hòa',
    x: 56,
    y: 75,
    color: '#f97316',
    history: 'Vùng đất mở phương Nam lâu đời, phát triển mạnh công nghiệp và đô thị.',
    geography:
      'Có sông Đồng Nai, rừng, hồ Trị An và vị trí kết nối TP. Hồ Chí Minh với Tây Nguyên.',
    tourism: ['Vườn quốc gia Cát Tiên', 'Hồ Trị An', 'Bửu Long'],
    highlight: 'Cửa ngõ Đông Nam Bộ',
  },
  {
    id: 'tay-ninh',
    name: 'Tây Ninh',
    region: 'Đông Nam Bộ',
    capital: 'Tây Ninh',
    x: 48,
    y: 76,
    color: '#ea580c',
    history: 'Nổi tiếng với đạo Cao Đài, căn cứ Trung ương Cục miền Nam và văn hóa biên giới.',
    geography: 'Nằm sát Campuchia, có núi Bà Đen, hồ Dầu Tiếng và đồng bằng bán sơn địa.',
    tourism: ['Núi Bà Đen', 'Tòa thánh Cao Đài', 'Hồ Dầu Tiếng'],
    highlight: 'Nóc nhà Nam Bộ',
  },
  {
    id: 'dong-thap',
    name: 'Đồng Tháp',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Cao Lãnh',
    x: 39,
    y: 81,
    color: '#22c55e',
    history: 'Vùng sen hồng, gắn với Đồng Tháp Mười và nhiều di tích thời kháng chiến.',
    geography: 'Nằm ở thượng nguồn sông Tiền, nhiều kênh rạch, đồng lúa và mùa nước nổi.',
    tourism: ['Tràm Chim', 'Làng hoa Sa Đéc', 'Gáo Giồng'],
    highlight: 'Đất sen hồng',
  },
  {
    id: 'vinh-long',
    name: 'Vĩnh Long',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Vĩnh Long',
    x: 44,
    y: 83,
    color: '#16a34a',
    history: 'Vùng cù lao và miệt vườn lâu đời, lưu giữ nhiều nếp sinh hoạt sông nước Nam Bộ.',
    geography: 'Nằm giữa sông Tiền và sông Hậu, có nhiều cù lao, vườn cây và kênh rạch.',
    tourism: ['Cù lao An Bình', 'Văn Thánh Miếu', 'Lò gạch Mang Thít'],
    highlight: 'Miệt vườn cù lao',
  },
  {
    id: 'an-giang',
    name: 'An Giang',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Long Xuyên',
    x: 34,
    y: 83,
    color: '#15803d',
    history: 'Vùng giao thoa văn hóa Kinh, Khmer, Chăm, Hoa, nổi tiếng lễ hội vía Bà Chúa Xứ.',
    geography: 'Có vùng Bảy Núi, đồng bằng ngập nước, sông Tiền và sông Hậu.',
    tourism: ['Núi Sam', 'Rừng tràm Trà Sư', 'Châu Đốc'],
    highlight: 'Bảy Núi huyền thoại',
  },
  {
    id: 'ca-mau',
    name: 'Cà Mau',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Cà Mau',
    x: 35,
    y: 91,
    color: '#0f766e',
    history: 'Vùng đất cuối trời phương Nam, hình thành cùng hành trình khai phá rừng ngập mặn.',
    geography: 'Là cực Nam Tổ quốc, có biển ba mặt, rừng đước và hệ sinh thái ngập mặn.',
    tourism: ['Mũi Cà Mau', 'Rừng U Minh Hạ', 'Đầm Thị Tường'],
    highlight: 'Cực Nam Tổ quốc',
  },
]

export const featuredVietnamMapPlaces = vietnamProvinceFeatures.filter((place) =>
  ['ha-noi', 'quang-ninh', 'hue', 'da-nang', 'ho-chi-minh', 'can-tho'].includes(place.id),
)
