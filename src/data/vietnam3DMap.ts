import { vietnamTourismCatalog, type TourismCategory } from '@/data/vietnamTourismCatalog'

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
  kind?: 'province' | 'archipelago'
  parentAdministrativeUnit?: string
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
  officialSourceUrl?: string
}

export interface VietnamTourismSpot {
  name: string
  category: TourismCategory
  description: string
  imageQuery?: string
  imageUrl?: string
  sourceUrl?: string
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

const vietnamProvinceBaseFeatures: VietnamProvinceFeature[] = [
  {
    id: 'ha-noi',
    name: 'Hà Nội',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Hà Nội',
    x: 50.4,
    y: 17.1,
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
    x: 73.5,
    y: 47.4,
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
    x: 65.6,
    y: 19.1,
    color: '#f97316',
    history:
      'Thành phố cảng hợp nhất với không gian xứ Đông Hải Dương, hội tụ truyền thống hàng hải, khoa bảng và các di tích Côn Sơn - Kiếp Bạc.',
    geography:
      'Trải từ vùng châu thổ sông Thái Bình ra vịnh Bắc Bộ, có hệ thống cảng biển, quần đảo Cát Bà và vùng đồng bằng nông nghiệp rộng.',
    tourism: ['Cát Bà', 'Đồ Sơn', 'Nhà hát lớn Hải Phòng'],
    highlight: 'Thành phố hoa phượng đỏ',
  },
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    region: 'Nam Trung Bộ',
    capital: 'Đà Nẵng',
    x: 77.9,
    y: 52.5,
    color: '#0ea5e9',
    history:
      'Thành phố mới hợp nhất Đà Nẵng và Quảng Nam, kết nối đô thị sông Hàn với thương cảng Hội An, thánh địa Mỹ Sơn và truyền thống đội Hoàng Sa.',
    geography:
      'Trải từ đặc khu Hoàng Sa, dải biển Sơn Trà - Cù Lao Chàm qua đồng bằng ven biển tới vùng núi cao phía tây giáp Lào.',
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
    x: 65.8,
    y: 83.3,
    color: '#14b8a6',
    history:
      'Đô thị lớn phương Nam, sau hợp nhất mở rộng trên không gian Thành phố Hồ Chí Minh, Bình Dương và Bà Rịa - Vũng Tàu, lưu giữ nhiều dấu mốc lịch sử hiện đại.',
    geography:
      'Không gian đô thị - công nghiệp - cảng biển liên hoàn từ sông Sài Gòn, vùng Đông Nam Bộ tới bờ biển Vũng Tàu và đặc khu Côn Đảo.',
    tourism: ['Dinh Độc Lập', 'Bưu điện Thành phố', 'Chợ Bến Thành'],
    highlight: 'Thành phố mang tên Bác',
  },
  {
    id: 'can-tho',
    name: 'Cần Thơ',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Cần Thơ',
    x: 51.7,
    y: 90.7,
    color: '#22c55e',
    history:
      'Thành phố mới hợp nhất Cần Thơ, Hậu Giang và Sóc Trăng, kết nối văn hóa Tây Đô, miệt vườn và di sản Khmer Nam Bộ.',
    geography:
      'Nằm ở trung tâm đồng bằng sông Cửu Long, trải dọc sông Hậu tới vùng cửa biển Trần Đề, có mạng lưới kênh rạch dày đặc.',
    tourism: ['Chợ nổi Cái Răng', 'Bến Ninh Kiều', 'Vườn trái cây Phong Điền'],
    highlight: 'Văn hóa miền sông nước',
  },
  {
    id: 'tuyen-quang',
    name: 'Tuyên Quang',
    region: 'Đông Bắc Bộ',
    capital: 'Tuyên Quang',
    x: 42.3,
    y: 7.4,
    color: '#16a34a',
    history:
      'Tỉnh mới hợp nhất Tuyên Quang và Hà Giang, vừa là vùng căn cứ cách mạng Tân Trào vừa lưu giữ di sản lâu đời của cao nguyên đá Đồng Văn.',
    geography:
      'Trải từ thung lũng sông Lô - sông Gâm đến cực Bắc với cao nguyên đá, núi cao, hẻm vực và đường biên giới dài.',
    tourism: ['Khu di tích Tân Trào', 'Hồ Na Hang', 'Thác Mơ'],
    highlight: 'Thủ đô khu giải phóng',
  },
  {
    id: 'cao-bang',
    name: 'Cao Bằng',
    region: 'Đông Bắc Bộ',
    capital: 'Cao Bằng',
    x: 55.1,
    y: 5.5,
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
    x: 20.7,
    y: 8.7,
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
    x: 34.5,
    y: 9.8,
    color: '#84cc16',
    history:
      'Tỉnh mới hợp nhất Lào Cai và Yên Bái, là không gian giao thoa văn hóa Tây Bắc gắn với Sa Pa, Nghĩa Lộ và Mù Cang Chải.',
    geography:
      'Có đỉnh Fansipan, thung lũng sông Hồng, dãy Hoàng Liên Sơn và các vùng ruộng bậc thang rộng lớn.',
    tourism: ['Sa Pa', 'Fansipan', 'Mù Cang Chải'],
    highlight: 'Nóc nhà Đông Dương',
  },
  {
    id: 'thai-nguyen',
    name: 'Thái Nguyên',
    region: 'Đông Bắc Bộ',
    capital: 'Thái Nguyên',
    x: 52.6,
    y: 10.1,
    color: '#059669',
    history:
      'Tỉnh mới hợp nhất Thái Nguyên và Bắc Kạn, gắn với ATK Định Hóa, truyền thống cách mạng và văn hóa trà trung du.',
    geography: 'Chuyển tiếp từ trung du đồi chè lên vùng núi đá vôi, rừng và hồ Ba Bể ở phía bắc.',
    tourism: ['Đồi chè Tân Cương', 'Hồ Núi Cốc', 'ATK Định Hóa'],
    highlight: 'Xứ trà trung du',
  },
  {
    id: 'dien-bien',
    name: 'Điện Biên',
    region: 'Tây Bắc Bộ',
    capital: 'Điện Biên Phủ',
    x: 17.4,
    y: 12.2,
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
    x: 63.2,
    y: 11,
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
    x: 32.2,
    y: 14.9,
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
    capital: 'Việt Trì',
    x: 46.6,
    y: 16.8,
    color: '#eab308',
    history:
      'Tỉnh mới hợp nhất Phú Thọ, Vĩnh Phúc và Hòa Bình, kết nối Đất Tổ Hùng Vương với không gian văn hóa Mường và vùng Tam Đảo.',
    geography:
      'Trải từ trung du hợp lưu các sông lớn qua dãy Tam Đảo tới thung lũng sông Đà và vùng núi Hòa Bình.',
    tourism: ['Đền Hùng', 'Ao Châu', 'Suối khoáng Thanh Thủy'],
    highlight: 'Cội nguồn dân tộc',
  },
  {
    id: 'bac-ninh',
    name: 'Bắc Ninh',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Bắc Giang',
    x: 59.9,
    y: 15,
    color: '#f59e0b',
    history:
      'Tỉnh mới hợp nhất Bắc Ninh và Bắc Giang, kế thừa không gian Kinh Bắc, dân ca quan họ, làng nghề và di sản Phật giáo Trúc Lâm.',
    geography:
      'Trải từ đồng bằng sông Cầu, sông Thương lên vùng đồi núi Tây Yên Tử ở phía đông bắc.',
    tourism: ['Chùa Dâu', 'Làng tranh Đông Hồ', 'Đền Đô'],
    highlight: 'Miền quan họ',
  },
  {
    id: 'quang-ninh',
    name: 'Quảng Ninh',
    region: 'Đông Bắc Bộ',
    capital: 'Hạ Long',
    x: 69.4,
    y: 15.7,
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
    x: 57.8,
    y: 19.4,
    color: '#facc15',
    history:
      'Tỉnh mới hợp nhất Hưng Yên và Thái Bình, kết nối thương cảng Phố Hiến với vùng phát tích triều Trần và văn hóa lúa nước.',
    geography:
      'Nằm trong châu thổ sông Hồng - sông Thái Bình, có đồng bằng phù sa rộng và bờ biển phía đông.',
    tourism: ['Phố Hiến', 'Đền Mẫu', 'Vườn nhãn lồng'],
    highlight: 'Phố Hiến xưa',
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    region: 'Đồng bằng Bắc Bộ',
    capital: 'Ninh Bình',
    x: 55.3,
    y: 21.4,
    color: '#fb923c',
    history:
      'Tỉnh mới hợp nhất Ninh Bình, Nam Định và Hà Nam, hội tụ Cố đô Hoa Lư, di sản tín ngưỡng thờ Mẫu và truyền thống văn hóa đồng bằng Bắc Bộ.',
    geography:
      'Có núi đá vôi, sông ngòi, đồng bằng phù sa và dải ven biển phía nam châu thổ sông Hồng.',
    tourism: ['Tràng An', 'Tam Cốc', 'Cố đô Hoa Lư'],
    highlight: 'Di sản Tràng An',
  },
  {
    id: 'thanh-hoa',
    name: 'Thanh Hóa',
    region: 'Bắc Trung Bộ',
    capital: 'Thanh Hóa',
    x: 45.3,
    y: 23.7,
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
    x: 40.8,
    y: 28.3,
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
    x: 52.2,
    y: 34.3,
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
    capital: 'Đồng Hới',
    x: 60.4,
    y: 42,
    color: '#dc2626',
    history:
      'Tỉnh mới hợp nhất Quảng Bình và Quảng Trị, lưu giữ hệ thống di tích chiến tranh cách mạng cùng di sản hang động Phong Nha - Kẻ Bàng.',
    geography:
      'Dải đất miền Trung từ vùng karst Phong Nha đến sông Bến Hải, có Trường Sơn, đồng bằng hẹp, biển và đảo Cồn Cỏ.',
    tourism: ['Thành cổ Quảng Trị', 'Cầu Hiền Lương', 'Địa đạo Vịnh Mốc'],
    highlight: 'Miền ký ức lịch sử',
  },
  {
    id: 'quang-ngai',
    name: 'Quảng Ngãi',
    region: 'Nam Trung Bộ',
    capital: 'Quảng Ngãi',
    x: 81.1,
    y: 58.5,
    color: '#f97316',
    history:
      'Tỉnh mới hợp nhất Quảng Ngãi và Kon Tum, kết nối văn hóa Sa Huỳnh, truyền thống đội Hoàng Sa với di sản các dân tộc Bắc Tây Nguyên.',
    geography:
      'Trải từ biên giới Việt Nam - Lào qua cao nguyên Kon Tum, dãy Trường Sơn tới đồng bằng ven biển và đặc khu Lý Sơn.',
    tourism: ['Lý Sơn', 'Mỹ Khê', 'Núi Thiên Ấn'],
    highlight: 'Đảo núi lửa Lý Sơn',
  },
  {
    id: 'gia-lai',
    name: 'Gia Lai',
    region: 'Tây Nguyên',
    capital: 'Quy Nhơn',
    x: 83.1,
    y: 64,
    color: '#8b5cf6',
    history:
      'Tỉnh mới hợp nhất Gia Lai và Bình Định, kết nối không gian cồng chiêng Tây Nguyên, văn hóa Chăm Pa và phong trào Tây Sơn.',
    geography:
      'Trải từ cao nguyên Pleiku, rừng và núi lửa cổ xuống đồng bằng ven biển Quy Nhơn, đầm Thị Nại và bán đảo Phương Mai.',
    tourism: ['Biển Hồ', 'Núi lửa Chư Đăng Ya', 'Quảng trường Đại Đoàn Kết'],
    highlight: 'Phố núi Pleiku',
  },
  {
    id: 'khanh-hoa',
    name: 'Khánh Hòa',
    region: 'Nam Trung Bộ',
    capital: 'Nha Trang',
    x: 90.2,
    y: 75.6,
    color: '#06b6d4',
    history:
      'Tỉnh mới hợp nhất Khánh Hòa và Ninh Thuận, có dấu ấn Chăm Pa, văn hóa biển lâu đời và đặc khu Trường Sa.',
    geography:
      'Có dải bờ biển khúc khuỷu với nhiều vịnh, vùng bán khô hạn Núi Chúa, đồng bằng ven biển và quần đảo Trường Sa.',
    tourism: ['Nha Trang', 'Tháp Bà Ponagar', 'Vịnh Vân Phong'],
    highlight: 'Biển xanh Nha Trang',
  },
  {
    id: 'lam-dong',
    name: 'Lâm Đồng',
    region: 'Tây Nguyên',
    capital: 'Đà Lạt',
    x: 79.3,
    y: 78.5,
    color: '#7c3aed',
    history:
      'Tỉnh mới hợp nhất Lâm Đồng, Đắk Nông và Bình Thuận, kết nối di sản cao nguyên, không gian cồng chiêng và văn hóa duyên hải Chăm Pa.',
    geography:
      "Trải từ cao nguyên Lang Biang và M'Nông xuống đồng bằng, cồn cát và bờ biển Bình Thuận.",
    tourism: ['Đà Lạt', 'Thác Datanla', 'Hồ Xuân Hương'],
    highlight: 'Thành phố ngàn hoa',
  },
  {
    id: 'dak-lak',
    name: 'Đắk Lắk',
    region: 'Tây Nguyên',
    capital: 'Buôn Ma Thuột',
    x: 83.8,
    y: 70.1,
    color: '#9333ea',
    history:
      'Tỉnh mới hợp nhất Đắk Lắk và Phú Yên, kết nối văn hóa Ê Đê, sử thi Tây Nguyên với di sản đá và biển của xứ Nẫu.',
    geography:
      'Trải từ cao nguyên bazan, lưu vực Sêrêpốk qua đèo núi xuống đồng bằng Tuy Hòa và bờ biển Phú Yên.',
    tourism: ['Buôn Đôn', 'Thác Dray Nur', 'Hồ Lắk'],
    highlight: 'Thủ phủ cà phê',
  },
  {
    id: 'dong-nai',
    name: 'Đồng Nai',
    region: 'Đông Nam Bộ',
    capital: 'Biên Hòa',
    x: 66.3,
    y: 79.9,
    color: '#f97316',
    history:
      'Tỉnh mới hợp nhất Đồng Nai và Bình Phước, là vùng đất mở phương Nam, giàu truyền thống công nghiệp, nông nghiệp và văn hóa S’tiêng.',
    geography:
      'Có sông Đồng Nai, hồ Trị An, rừng Cát Tiên - Bù Gia Mập và đường biên giới Campuchia ở phía bắc.',
    tourism: ['Vườn quốc gia Cát Tiên', 'Hồ Trị An', 'Bửu Long'],
    highlight: 'Cửa ngõ Đông Nam Bộ',
  },
  {
    id: 'tay-ninh',
    name: 'Tây Ninh',
    region: 'Đông Nam Bộ',
    capital: 'Tân An',
    x: 56,
    y: 82.2,
    color: '#ea580c',
    history:
      'Tỉnh mới hợp nhất Tây Ninh và Long An, kết nối vùng đất thánh Cao Đài, căn cứ Trung ương Cục với cửa ngõ khai mở miền Tây Nam Bộ.',
    geography:
      'Trải từ núi Bà Đen và hồ Dầu Tiếng qua vùng biên giới Campuchia tới đồng bằng sông Vàm Cỏ và Đồng Tháp Mười.',
    tourism: ['Núi Bà Đen', 'Tòa thánh Cao Đài', 'Hồ Dầu Tiếng'],
    highlight: 'Nóc nhà Nam Bộ',
  },
  {
    id: 'dong-thap',
    name: 'Đồng Tháp',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Mỹ Tho',
    x: 54.6,
    y: 85.7,
    color: '#22c55e',
    history:
      'Tỉnh mới hợp nhất Đồng Tháp và Tiền Giang, kết nối đất sen hồng, văn hóa Sa Đéc với vùng Mỹ Tho - Gò Công lâu đời.',
    geography:
      'Trải dọc sông Tiền từ vùng đầu nguồn, Đồng Tháp Mười tới các cù lao, miệt vườn và cửa biển Gò Công.',
    tourism: ['Tràm Chim', 'Làng hoa Sa Đéc', 'Gáo Giồng'],
    highlight: 'Đất sen hồng',
  },
  {
    id: 'vinh-long',
    name: 'Vĩnh Long',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Vĩnh Long',
    x: 57.3,
    y: 89.8,
    color: '#16a34a',
    history:
      'Tỉnh mới hợp nhất Vĩnh Long, Bến Tre và Trà Vinh, hội tụ văn hóa miệt vườn, xứ dừa và di sản Khmer Nam Bộ.',
    geography:
      'Nằm giữa các nhánh sông Tiền - sông Hậu, có cù lao, vườn cây, vùng dừa và dải cửa biển rộng.',
    tourism: ['Cù lao An Bình', 'Văn Thánh Miếu', 'Lò gạch Mang Thít'],
    highlight: 'Miệt vườn cù lao',
  },
  {
    id: 'an-giang',
    name: 'An Giang',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Rạch Giá',
    x: 36.9,
    y: 88.6,
    color: '#15803d',
    history:
      'Tỉnh mới hợp nhất An Giang và Kiên Giang, là vùng giao thoa văn hóa Kinh, Khmer, Chăm, Hoa và lịch sử khai mở miền biên viễn Tây Nam.',
    geography:
      'Có Bảy Núi, đồng bằng sông Hậu, bờ biển Tây cùng các quần đảo Phú Quốc, Nam Du và vùng Hà Tiên.',
    tourism: ['Núi Sam', 'Rừng tràm Trà Sư', 'Châu Đốc'],
    highlight: 'Bảy Núi huyền thoại',
  },
  {
    id: 'ca-mau',
    name: 'Cà Mau',
    region: 'Đồng bằng Sông Cửu Long',
    capital: 'Cà Mau',
    x: 44.9,
    y: 95.9,
    color: '#0f766e',
    history:
      'Tỉnh mới hợp nhất Cà Mau và Bạc Liêu, kết nối vùng đất cuối trời phương Nam với di sản đờn ca tài tử và câu chuyện Công tử Bạc Liêu.',
    geography:
      'Nằm ở cực Nam Tổ quốc, có biển rộng, rừng đước - rừng tràm, vùng nuôi thủy sản và các cánh đồng điện gió ven bờ.',
    tourism: ['Mũi Cà Mau', 'Rừng U Minh Hạ', 'Đầm Thị Tường'],
    highlight: 'Cực Nam Tổ quốc',
  },
  {
    id: 'hoang-sa',
    name: 'Hoàng Sa',
    kind: 'archipelago',
    parentAdministrativeUnit: 'Thành phố Đà Nẵng',
    region: 'Nam Trung Bộ',
    capital: 'Đặc khu Hoàng Sa',
    x: 76.4,
    y: 31.5,
    color: '#38bdf8',
    history:
      'Nhiều châu bản, bản đồ và tư liệu lịch sử ghi nhận quá trình xác lập, thực thi chủ quyền liên tục của Việt Nam đối với quần đảo Hoàng Sa.',
    geography:
      'Quần đảo của Việt Nam trên Biển Đông, hiện là đặc khu Hoàng Sa thuộc thành phố Đà Nẵng.',
    tourism: [],
    highlight: 'Đặc khu biển đảo thuộc Đà Nẵng',
    officialSourceUrl:
      'https://congbaocdn.chinhphu.vn/CongBaoCP/CongBao/2025/6/45107/56815-1-801-802.pdf',
  },
  {
    id: 'truong-sa',
    name: 'Trường Sa',
    kind: 'archipelago',
    parentAdministrativeUnit: 'Tỉnh Khánh Hòa',
    region: 'Nam Trung Bộ',
    capital: 'Đặc khu Trường Sa',
    x: 88.2,
    y: 73.3,
    color: '#0891b2',
    history:
      'Việt Nam có hệ thống tư liệu lịch sử và hoạt động quản lý nhà nước khẳng định chủ quyền đối với quần đảo Trường Sa.',
    geography:
      'Quần đảo của Việt Nam trên Biển Đông, hiện là đặc khu Trường Sa thuộc tỉnh Khánh Hòa.',
    tourism: [],
    highlight: 'Đặc khu biển đảo thuộc Khánh Hòa',
    officialSourceUrl: 'https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/12/24-bnv.pdf',
  },
]

const ADMINISTRATIVE_SOURCE_URL =
  'https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm'

export const vietnamProvinceFeatures: VietnamProvinceFeature[] = vietnamProvinceBaseFeatures.map(
  (place) => {
    const catalog = vietnamTourismCatalog[place.id]
    if (!catalog) {
      return {
        ...place,
        kind: place.kind ?? 'province',
        officialSourceUrl: place.officialSourceUrl ?? ADMINISTRATIVE_SOURCE_URL,
      }
    }

    return {
      ...place,
      kind: place.kind ?? 'province',
      tourism: catalog.map((item) => item.name),
      tourismDetails: catalog.map((item) => ({
        ...item,
        sourceUrl: `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(item.imageQuery)}&title=Special:MediaSearch&type=image`,
      })),
      officialSourceUrl: place.officialSourceUrl ?? ADMINISTRATIVE_SOURCE_URL,
    }
  },
)

export const featuredVietnamMapPlaces = vietnamProvinceFeatures.filter((place) =>
  ['ha-noi', 'quang-ninh', 'hue', 'da-nang', 'ho-chi-minh', 'can-tho'].includes(place.id),
)
