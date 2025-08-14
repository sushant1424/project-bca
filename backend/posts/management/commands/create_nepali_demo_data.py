from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from posts.models import Category, Post, Comment, Follow
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create Nepali demo data for the application (preserves existing data)'

    def handle(self, *args, **options):
        self.stdout.write('Creating Nepali demo data...')
        
        # Create additional categories if they don't exist
        nepali_categories_data = [
            {"name": "Travel", "description": "Travel experiences and destinations"},
            {"name": "Culture", "description": "Cultural insights and traditions"},
            {"name": "Politics", "description": "Political discussions and news"},
            {"name": "Sports", "description": "Sports news and discussions"},
            {"name": "Health", "description": "Health and wellness topics"},
            {"name": "Finance", "description": "Financial advice and news"},
            {"name": "Photography", "description": "Photography and visual arts"},
            {"name": "Music", "description": "Music and entertainment"},
        ]
        
        categories = {}
        # Get existing categories
        for cat in Category.objects.all():
            categories[cat.name] = cat
            
        # Create new categories if they don't exist
        for cat_data in nepali_categories_data:
            name = cat_data["name"]
            if name not in categories:
                category = Category.objects.create(
                    name=name,
                    slug=slugify(name),
                    description=cat_data["description"]
                )
                categories[name] = category
                self.stdout.write(f'Created new category: {name}')
            else:
                self.stdout.write(f'Category already exists: {name}')
        
        # Create Nepali demo users
        nepali_users_data = [
            {"username": "aaditya_sharma", "email": "aaditya.sharma@gmail.com", "first_name": "Aaditya", "last_name": "Sharma"},
            {"username": "priya_thapa", "email": "priya.thapa@gmail.com", "first_name": "Priya", "last_name": "Thapa"},
            {"username": "rajesh_poudel", "email": "rajesh.poudel@gmail.com", "first_name": "Rajesh", "last_name": "Poudel"},
            {"username": "sita_gurung", "email": "sita.gurung@gmail.com", "first_name": "Sita", "last_name": "Gurung"},
            {"username": "kiran_shrestha", "email": "kiran.shrestha@gmail.com", "first_name": "Kiran", "last_name": "Shrestha"},
            {"username": "maya_tamang", "email": "maya.tamang@gmail.com", "first_name": "Maya", "last_name": "Tamang"},
            {"username": "bikash_rai", "email": "bikash.rai@gmail.com", "first_name": "Bikash", "last_name": "Rai"},
            {"username": "sunita_magar", "email": "sunita.magar@gmail.com", "first_name": "Sunita", "last_name": "Magar"},
            {"username": "dipesh_karki", "email": "dipesh.karki@gmail.com", "first_name": "Dipesh", "last_name": "Karki"},
            {"username": "anita_adhikari", "email": "anita.adhikari@gmail.com", "first_name": "Anita", "last_name": "Adhikari"},
            {"username": "suresh_bhattarai", "email": "suresh.bhattarai@gmail.com", "first_name": "Suresh", "last_name": "Bhattarai"},
            {"username": "kamala_nepal", "email": "kamala.nepal@gmail.com", "first_name": "Kamala", "last_name": "Nepal"},
            {"username": "ramesh_limbu", "email": "ramesh.limbu@gmail.com", "first_name": "Ramesh", "last_name": "Limbu"},
            {"username": "gita_pandey", "email": "gita.pandey@gmail.com", "first_name": "Gita", "last_name": "Pandey"},
            {"username": "nabin_kc", "email": "nabin.kc@gmail.com", "first_name": "Nabin", "last_name": "KC"},
            {"username": "sabina_oli", "email": "sabina.oli@gmail.com", "first_name": "Sabina", "last_name": "Oli"},
            {"username": "prakash_dahal", "email": "prakash.dahal@gmail.com", "first_name": "Prakash", "last_name": "Dahal"},
            {"username": "ritu_basnet", "email": "ritu.basnet@gmail.com", "first_name": "Ritu", "last_name": "Basnet"},
            {"username": "santosh_joshi", "email": "santosh.joshi@gmail.com", "first_name": "Santosh", "last_name": "Joshi"},
            {"username": "laxmi_chaudhary", "email": "laxmi.chaudhary@gmail.com", "first_name": "Laxmi", "last_name": "Chaudhary"},
        ]
        
        created_users = []
        for user_data in nepali_users_data:
            # Check if user already exists
            if not User.objects.filter(username=user_data["username"]).exists():
                user = User.objects.create_user(
                    username=user_data["username"],
                    email=user_data["email"],
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    password="demo123"  # Simple password for demo
                )
                created_users.append(user)
                self.stdout.write(f'Created user: {user.username}')
            else:
                user = User.objects.get(username=user_data["username"])
                created_users.append(user)
                self.stdout.write(f'User already exists: {user.username}')
        
        # Get all users (existing + new)
        all_users = list(User.objects.all())
        
        # Create comprehensive posts with long-form content
        posts_data = [
            {
                "title": "Exploring the Hidden Gems of Nepal: A Journey Through Annapurna Circuit",
                "content": """Nepal, the land of the Himalayas, offers some of the most breathtaking trekking experiences in the world. The Annapurna Circuit, one of Nepal's most popular trekking routes, is a journey that takes you through diverse landscapes, from subtropical forests to alpine meadows, and finally to the high-altitude desert of the Tibetan plateau.

The trek typically takes 15-20 days to complete, covering approximately 230 kilometers of rugged mountain terrain. Starting from Besisahar, the trail winds through traditional villages where time seems to have stood still. The warm hospitality of the local people, predominantly Gurung and Manangi communities, adds a cultural dimension to this incredible journey.

One of the highlights of the trek is crossing the Thorong La Pass at 5,416 meters, one of the highest trekking passes in the world. The sense of achievement when you reach the top, surrounded by snow-capped peaks and prayer flags fluttering in the wind, is indescribable.

The biodiversity along the trail is remarkable. From rhododendron forests that bloom in vibrant colors during spring to the rare blue sheep and snow leopards in the higher altitudes, the Annapurna region is a paradise for nature lovers.

For those planning this adventure, the best times to trek are during spring (March-May) and autumn (September-November) when the weather is stable and the views are crystal clear. Proper acclimatization is crucial, and trekkers should be prepared for altitude sickness and changing weather conditions.

The local tea houses along the route provide basic accommodation and meals, offering dal bhat (rice and lentils), which becomes a comforting staple during the trek. The simple pleasure of a hot cup of tea while watching the sunrise over the Himalayas is something every trekker cherishes.

This journey is not just about reaching a destination; it's about discovering your inner strength, connecting with nature, and experiencing the rich culture of the Himalayan people. The Annapurna Circuit remains one of the most transformative experiences one can have in Nepal.""",
                "category": "Travel",
                "author_index": 0
            },
            {
                "title": "The Digital Revolution in Nepal: How Technology is Transforming Rural Communities",
                "content": """Nepal's technological landscape has undergone a remarkable transformation in the past decade. From a country where internet connectivity was a luxury to one where digital payments and online services are becoming commonplace, the journey has been extraordinary.

The introduction of 4G networks across the country has been a game-changer. Remote villages that were once completely cut off from the digital world now have access to high-speed internet. This connectivity has opened up new opportunities for education, healthcare, and economic development.

E-commerce platforms like Daraz and SastoDeal have revolutionized shopping habits, especially during the COVID-19 pandemic. People in remote areas can now access products that were previously unavailable, from books and electronics to clothing and household items.

Digital payment systems like eSewa, Khalti, and IME Pay have made financial transactions more convenient and secure. The adoption of QR code payments has been particularly impressive, with small vendors and street food sellers embracing this technology enthusiastically.

The education sector has also benefited significantly from this digital revolution. Online learning platforms and virtual classrooms have made quality education accessible to students in remote areas. During the pandemic, these platforms proved crucial in ensuring continuity of education.

Telemedicine has emerged as a vital service, connecting patients in rural areas with doctors in urban centers. This has been particularly beneficial for areas where medical facilities are scarce or non-existent.

The rise of digital entrepreneurship is another exciting development. Young Nepalis are creating innovative startups, from food delivery services to fintech solutions, contributing to the country's economic growth and job creation.

However, challenges remain. The digital divide between urban and rural areas is still significant. Infrastructure development, digital literacy, and cybersecurity are areas that need continued attention and investment.

The government's Digital Nepal Framework aims to transform Nepal into a digitally empowered society by 2025. With initiatives like the National ID card system and digital governance projects, Nepal is steadily moving towards becoming a digital economy.

The future looks promising as Nepal continues to embrace technology while preserving its rich cultural heritage. The key is to ensure that this digital transformation is inclusive and benefits all segments of society.""",
                "category": "Technology",
                "author_index": 1
            },
            {
                "title": "Preserving Nepal's Cultural Heritage in the Modern Era",
                "content": """Nepal's cultural heritage is a tapestry woven with threads of ancient traditions, diverse ethnic communities, and spiritual practices that have evolved over millennia. As the country modernizes rapidly, preserving this rich cultural legacy has become both a challenge and a priority.

The Kathmandu Valley alone houses seven UNESCO World Heritage Sites, including ancient palaces, temples, and stupas that showcase the architectural brilliance of the Newar civilization. These monuments are not just tourist attractions; they are living testimonies to Nepal's glorious past and centers of ongoing religious and cultural activities.

Traditional festivals like Dashain, Tihar, Holi, and Buddha Jayanti continue to bring communities together, transcending religious and ethnic boundaries. These celebrations are crucial in maintaining social cohesion and passing down cultural values to younger generations.

The art of traditional craftsmanship, including wood carving, metalwork, and thangka painting, faces the challenge of finding skilled artisans willing to continue these time-honored practices. Many young people are drawn to modern careers, leaving traditional crafts at risk of disappearing.

Language preservation is another critical aspect of cultural heritage conservation. Nepal is home to over 120 languages, many of which are spoken by small communities and are at risk of extinction. Efforts to document and promote these languages through education and media are essential for maintaining linguistic diversity.

Traditional music and dance forms like classical Nepali folk songs, Newari music, and various ethnic dances are being preserved through cultural organizations and schools. These art forms are not just entertainment; they carry historical narratives and cultural wisdom.

The role of museums and cultural institutions has become increasingly important. The National Museum of Nepal and various local museums work tirelessly to collect, preserve, and display artifacts that tell the story of Nepal's cultural evolution.

Modern technology is playing a crucial role in preservation efforts. Digital archiving, virtual reality experiences, and online platforms are making cultural heritage more accessible to younger generations and the global community.

Community involvement is key to successful preservation efforts. Local communities are the true guardians of cultural heritage, and their active participation in conservation activities ensures authenticity and continuity.

Education plays a vital role in cultural preservation. Schools and universities are incorporating cultural studies into their curricula, helping students understand and appreciate their heritage while preparing them for a globalized world.

The challenge lies in finding the right balance between preservation and progress. Nepal must embrace modernity while ensuring that its cultural identity remains intact for future generations to cherish and learn from.""",
                "category": "Culture",
                "author_index": 2
            },
            {
                "title": "Nepal's Economic Transformation: Opportunities and Challenges in the Post-Pandemic Era",
                "content": """Nepal's economy has shown remarkable resilience in the face of multiple challenges, from devastating earthquakes to the global COVID-19 pandemic. As the country emerges from these crises, new opportunities and challenges are shaping its economic landscape.

The remittance economy, which contributes nearly 25% of Nepal's GDP, has been both a blessing and a challenge. While remittances from Nepali workers abroad have provided crucial foreign exchange and supported millions of families, the country's heavy dependence on this source of income has highlighted the need for economic diversification.

Tourism, traditionally one of Nepal's major economic pillars, was severely impacted by the pandemic. However, the sector is showing signs of recovery with the gradual reopening of international borders and the implementation of health and safety protocols. The government's "Visit Nepal 2023" campaign aims to attract 2 million tourists, focusing on sustainable and responsible tourism practices.

The hydropower sector presents enormous potential for Nepal's economic growth. With an estimated capacity of over 83,000 MW, Nepal could become a major energy exporter in South Asia. Recent projects like the Upper Tamakoshi Hydroelectric Project and ongoing negotiations for energy trade with India and Bangladesh indicate positive momentum in this sector.

Agriculture remains the backbone of Nepal's economy, employing about 65% of the population. However, the sector faces challenges including climate change, outdated farming practices, and limited access to modern technology. Government initiatives promoting organic farming, cooperatives, and agricultural modernization are showing promising results.

The manufacturing sector, though small, is gradually expanding. The government's industrial policy focuses on promoting industries that can utilize local raw materials and create employment opportunities. The pharmaceutical industry, in particular, has shown significant growth potential.

Financial inclusion has improved dramatically with the expansion of banking services and mobile banking platforms. Microfinance institutions have played a crucial role in providing financial services to rural and marginalized communities, enabling small-scale entrepreneurship and poverty reduction.

The informal economy, which constitutes a significant portion of Nepal's economic activity, presents both challenges and opportunities. Efforts to formalize this sector through policy reforms and incentives could boost tax revenue and improve working conditions.

Infrastructure development remains a key priority. The completion of major projects like the Melamchi Water Supply Project and ongoing road construction initiatives are expected to boost economic activity and improve quality of life.

Foreign investment policies have been liberalized to attract international investors. The establishment of special economic zones and industrial parks aims to create an investor-friendly environment and promote export-oriented industries.

Climate change poses significant risks to Nepal's economy, particularly affecting agriculture, tourism, and hydropower generation. Adaptation and mitigation strategies are essential for sustainable economic development.

The young and dynamic population of Nepal represents both an opportunity and a challenge. While the demographic dividend could drive economic growth, the lack of adequate employment opportunities has led to significant out-migration.

Looking ahead, Nepal's economic success will depend on its ability to diversify its economy, improve productivity, and create an enabling environment for sustainable and inclusive growth.""",
                "category": "Business",
                "author_index": 3
            },
            {
                "title": "The Rise of Nepali Cuisine: From Local Delicacy to Global Recognition",
                "content": """Nepali cuisine, with its rich flavors and diverse influences, is gaining international recognition as food enthusiasts around the world discover the unique tastes of the Himalayas. From the iconic dal bhat to the beloved momos, Nepali food represents a perfect blend of Indian, Tibetan, and Chinese culinary traditions.

Dal bhat, the national dish of Nepal, is more than just a meal; it's a cultural institution. This simple yet nutritious combination of lentil soup, rice, and vegetables provides the energy needed for the physically demanding lifestyle of the Himalayan people. The beauty of dal bhat lies in its versatility – each region and household has its own variation, incorporating local vegetables, spices, and cooking techniques.

Momos, the beloved dumplings that have become synonymous with Nepali cuisine, have an interesting history. Originally brought by Tibetan immigrants, momos have been adapted and perfected by Nepali cooks. Today, you can find countless varieties – from traditional buffalo meat momos to innovative vegetarian options with paneer, vegetables, or even chocolate for dessert momos.

The diversity of Nepali cuisine reflects the country's ethnic and geographical diversity. The Newari community of the Kathmandu Valley has contributed dishes like bara (lentil pancakes), chatamari (Nepali pizza), and various fermented foods. The Thakali people from the Mustang region are famous for their thakali khana set, which includes perfectly balanced flavors and nutritional content.

Gundruk, fermented leafy greens, is perhaps one of the most unique aspects of Nepali cuisine. This traditional preservation method not only extends the shelf life of vegetables but also enhances their nutritional value and creates a distinctive tangy flavor that's beloved by Nepalis worldwide.

The art of spice blending in Nepali cooking is sophisticated yet understated. Unlike some South Asian cuisines that rely heavily on heat, Nepali food focuses on aromatic spices like cumin, coriander, turmeric, and garam masala to create complex flavor profiles without overwhelming the palate.

Tea culture in Nepal is deeply ingrained in daily life. From the sweet, spiced chiya served in small glasses to the traditional butter tea of high-altitude regions, tea is more than a beverage – it's a social ritual that brings people together.

The growing popularity of Nepali restaurants worldwide has introduced international diners to authentic Nepali flavors. Cities like New York, London, and Sydney now boast excellent Nepali restaurants that serve traditional dishes alongside fusion creations that appeal to local tastes.

Food festivals and cultural events have played a crucial role in promoting Nepali cuisine. Events like the Nepal Food Festival and various cultural celebrations in the diaspora communities help preserve culinary traditions while introducing them to new audiences.

The farm-to-table movement has found natural expression in Nepal, where most ingredients are locally sourced and organic by default. This sustainable approach to food production and consumption is increasingly appealing to health-conscious consumers worldwide.

Cooking techniques passed down through generations are being documented and preserved by food enthusiasts and researchers. Traditional methods like smoking, fermentation, and slow cooking are being recognized for their contribution to flavor development and nutritional enhancement.

The challenge for Nepali cuisine's global expansion lies in maintaining authenticity while adapting to local tastes and ingredient availability. Successful Nepali restaurants abroad have mastered this balance, offering genuine flavors while making necessary adaptations.

As Nepal's tourism industry recovers and grows, culinary tourism is emerging as a significant attraction. Cooking classes, food tours, and farm visits are becoming popular activities for visitors who want to experience authentic Nepali culture through its cuisine.

The future of Nepali cuisine looks bright as young chefs experiment with traditional recipes, creating innovative dishes that honor their heritage while appealing to contemporary tastes. This culinary evolution ensures that Nepali food will continue to delight palates around the world.""",
                "category": "Food",
                "author_index": 4
            },
            {
                "title": "Mental Health Awareness in Nepal: Breaking the Stigma and Building Support Systems",
                "content": """Mental health awareness in Nepal has gained significant momentum in recent years, as society gradually recognizes the importance of psychological well-being alongside physical health. This shift represents a crucial step forward in a country where mental health issues have long been stigmatized and misunderstood.

Traditional Nepali society has often viewed mental health problems through the lens of spiritual or supernatural causes, leading to treatments that may not address the underlying psychological issues. However, increasing education and exposure to global health practices are changing these perceptions.

The COVID-19 pandemic has served as a catalyst for mental health awareness in Nepal. The isolation, economic uncertainty, and health fears experienced during lockdowns highlighted the prevalence of anxiety, depression, and other mental health conditions across all segments of society.

Young people, particularly students, face unique mental health challenges in Nepal. Academic pressure, career uncertainty, and social expectations create significant stress. The increasing rates of suicide among young Nepalis have prompted urgent discussions about mental health support in educational institutions.

Women in Nepal face additional mental health challenges due to gender-based discrimination, domestic violence, and limited access to resources. Traditional gender roles and expectations often prevent women from seeking help or expressing their mental health concerns openly.

The earthquake of 2015 had lasting psychological impacts on survivors, highlighting the need for trauma-informed mental health services. Many people continue to experience post-traumatic stress disorder (PTSD), anxiety, and depression related to the disaster.

Access to mental health services remains limited, particularly in rural areas. Nepal has a severe shortage of mental health professionals, with most services concentrated in urban centers. This geographical disparity means that many people cannot access the help they need.

Community-based mental health programs are showing promise in addressing service gaps. Training community health workers and volunteers to identify and provide basic support for mental health issues is helping to extend services to underserved areas.

The role of traditional healers and religious leaders in mental health care cannot be ignored. Integrating traditional practices with modern psychological interventions, where appropriate, may provide more culturally acceptable and effective treatment options.

Workplace mental health is gaining attention as employers recognize the impact of psychological well-being on productivity and employee satisfaction. Some progressive companies are implementing employee assistance programs and mental health awareness initiatives.

Social media and technology are playing dual roles in mental health. While they can contribute to anxiety and depression, they also provide platforms for mental health education, support groups, and teletherapy services.

The government's National Mental Health Policy aims to integrate mental health services into primary healthcare and reduce stigma through public awareness campaigns. However, implementation challenges remain significant.

NGOs and civil society organizations are playing crucial roles in mental health advocacy and service provision. Organizations like the Center for Mental Health and Counselling Nepal are working to train counselors and provide affordable mental health services.

Educational institutions are beginning to incorporate mental health awareness into their curricula and provide counseling services to students. This early intervention approach is crucial for preventing more serious mental health problems later in life.

The media's role in mental health awareness is evolving. Responsible reporting on mental health issues and suicide prevention is becoming more common, though sensationalized coverage still occurs occasionally.

Family support systems, traditionally strong in Nepali society, are being recognized as crucial components of mental health care. Educating families about mental health can improve support for affected individuals and reduce stigma.

Looking forward, Nepal needs to invest in training more mental health professionals, improving access to services, and continuing public education campaigns. The integration of mental health into overall healthcare policy and practice is essential for creating a society where psychological well-being is valued and protected.""",
                "category": "Health",
                "author_index": 5
            },
        ]
        
        # Create posts
        created_posts = []
        for i, post_data in enumerate(posts_data):
            author = created_users[post_data["author_index"] % len(created_users)]
            category = categories.get(post_data["category"])
            
            if category:
                post = Post.objects.create(
                    title=post_data["title"],
                    content=post_data["content"],
                    author=author,
                    category=category,
                    is_published=True,
                    created_at=timezone.now() - timedelta(days=random.randint(1, 30))
                )
                created_posts.append(post)
                self.stdout.write(f'Created post: {post.title[:50]}...')
        
        # Create additional shorter posts for variety
        short_posts_data = [
            {"title": "Best Hiking Trails Around Kathmandu", "content": "Discover amazing hiking trails within a few hours of Kathmandu. From Nagarkot to Shivapuri, these trails offer stunning views and fresh mountain air. Perfect for weekend adventures!", "category": "Travel"},
            {"title": "Traditional Nepali Breakfast Ideas", "content": "Start your day with authentic Nepali breakfast options. Sel roti, chiura, and traditional tea make for a perfect morning meal that connects you with Nepali culture.", "category": "Food"},
            {"title": "Learning Programming in Nepal", "content": "The tech scene in Nepal is growing rapidly. Here are the best resources and communities for learning programming languages like Python, JavaScript, and Java in Nepal.", "category": "Technology"},
            {"title": "Celebrating Dashain: Traditions and Memories", "content": "Dashain is more than a festival; it's a time for family reunions, traditional foods, and cultural celebrations. Share your favorite Dashain memories and traditions.", "category": "Culture"},
            {"title": "Small Business Ideas for Nepal", "content": "Explore profitable small business opportunities in Nepal. From organic farming to digital services, discover ideas that can thrive in the Nepali market.", "category": "Business"},
            {"title": "Photography Tips for Nepal's Landscapes", "content": "Capture the beauty of Nepal's diverse landscapes. From mountain peaks to ancient temples, learn techniques for stunning photography in challenging conditions.", "category": "Photography"},
            {"title": "Traditional Music of Nepal", "content": "Explore the rich musical heritage of Nepal. From classical ragas to folk songs, Nepali music reflects the country's cultural diversity and spiritual traditions.", "category": "Music"},
            {"title": "Yoga and Meditation in the Himalayas", "content": "Nepal offers unique opportunities for spiritual practice. Discover meditation centers, yoga retreats, and spiritual teachers in the land of the Buddha.", "category": "Health"},
        ]
        
        for post_data in short_posts_data:
            author = random.choice(created_users)
            category = categories.get(post_data["category"])
            
            if category:
                post = Post.objects.create(
                    title=post_data["title"],
                    content=post_data["content"],
                    author=author,
                    category=category,
                    is_published=True,
                    created_at=timezone.now() - timedelta(days=random.randint(1, 15))
                )
                created_posts.append(post)
                self.stdout.write(f'Created short post: {post.title}')
        
        # Create realistic interactions (likes, comments, follows, views)
        self.stdout.write('Creating user interactions...')
        
        # Create follows (users following each other)
        for user in created_users:
            # Each user follows 3-8 random other users
            potential_follows = [u for u in all_users if u != user]
            num_follows = random.randint(3, min(8, len(potential_follows)))
            users_to_follow = random.sample(potential_follows, num_follows)
            
            for follow_user in users_to_follow:
                Follow.objects.get_or_create(follower=user, following=follow_user)
        
        # Create likes for posts
        for post in created_posts:
            # Each post gets 5-25 likes from random users
            num_likes = random.randint(5, min(25, len(all_users)))
            users_to_like = random.sample(all_users, num_likes)
            
            for user in users_to_like:
                post.likes.add(user)
        
        # Create comments
        comment_texts = [
            "Great article! Very informative.",
            "Thanks for sharing this valuable information.",
            "I completely agree with your perspective.",
            "This is exactly what I was looking for.",
            "Excellent writing! Keep up the good work.",
            "Very helpful post. Thank you!",
            "Interesting insights. Would love to read more.",
            "Well researched and well written.",
            "This resonates with my experience too.",
            "Amazing content! Shared with my friends.",
        ]
        
        for post in created_posts:
            # Each post gets 2-8 comments
            num_comments = random.randint(2, 8)
            for _ in range(num_comments):
                commenter = random.choice(all_users)
                comment_text = random.choice(comment_texts)
                
                Comment.objects.create(
                    post=post,
                    author=commenter,
                    content=comment_text,
                    created_at=timezone.now() - timedelta(days=random.randint(0, 20))
                )
        
        # Update post views count directly
        for post in created_posts:
            # Each post gets 20-100 views
            post.views = random.randint(20, 100)
            post.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created Nepali demo data:\n'
                f'- {len(created_users)} new users\n'
                f'- {len(created_posts)} new posts\n'
                f'- Multiple categories, likes, comments, follows, and views\n'
                f'All existing data has been preserved!'
            )
        )
