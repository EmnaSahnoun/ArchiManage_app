import 'package:flutter/material.dart';
import '../features/project_details/screens/project_details_screen.dart';

class ProjectScreen extends StatefulWidget {
  const ProjectScreen({super.key});

  @override
  State<ProjectScreen> createState() => _ProjectScreenState();
}

class _ProjectScreenState extends State<ProjectScreen> {
  String searchQuery = '';
  String viewMode = 'list'; // 'list' or 'card'
  final List<Map<String, dynamic>> projects = [
    {
      'id': '1',
      'name': 'Projet 1',
      'createdAt': '01/01/2025',
      'startDate': '01/01/2025',
      'endDate': '31/12/2025',
      'progress': 50,
      'status': 'En cours',
      'members': [
        {'name': 'John Doe', 'image': 'assets/member1.jpg'},
        {'name': 'Jane Smith', 'image': 'assets/member2.jpg'},
      ],
      'phases': ['Phase 1', 'Phase 2'],
    },
    {
      'id': '2',
      'name': 'Projet 2',
      'createdAt': '01/01/2025',
      'startDate': '01/02/2025',
      'endDate': '30/06/2025',
      'progress': 30,
      'status': 'A venir',
      'members': [
        {'name': 'Alice Johnson', 'image': 'assets/member3.jpg'},
        {'name': 'Bob Brown', 'image': 'assets/member4.jpg'},
      ],
      'phases': ['Phase 1'],
    },
  ];

  List<Map<String, dynamic>> get filteredProjects {
    if (searchQuery.isEmpty) return projects;
    return projects.where((project) => 
      project['name'].toLowerCase().contains(searchQuery.toLowerCase())
    ).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Liste des Projets'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Header with search, date and actions
            _buildProjectHeader(),
            const SizedBox(height: 16),
            // Projects display
            Expanded(child: _buildProjectsDisplay()),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addProject,
        backgroundColor: const Color(0xFFE27D60),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildProjectHeader() {
    return Column(
      children: [
        // Search bar
        TextField(
          decoration: InputDecoration(
            hintText: 'Rechercher un projet...',
            prefixIcon: const Icon(Icons.search),
            filled: true,
            fillColor: const Color(0xFFD6D6D6),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide.none,
            ),
          ),
          onChanged: (value) => setState(() => searchQuery = value),
        ),
        const SizedBox(height: 16),
        // Date and view mode
        Row(
          children: [
            // Current date
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFCCCCCC),
                borderRadius: BorderRadius.circular(30),
              ),
              child: Text(
                DateTime.now().toString().substring(0, 10),
                style: const TextStyle(fontSize: 16),
              ),
            ),
            const Spacer(),
            // Filter button
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.filter_alt, size: 20),
              label: const Text('Filtrer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE27D60),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // View mode toggle
            ToggleButtons(
              isSelected: [viewMode == 'list', viewMode == 'card'],
              onPressed: (index) => setState(() => viewMode = index == 0 ? 'list' : 'card'),
              borderRadius: BorderRadius.circular(20),
              children: const [
                Icon(Icons.view_list),
                Icon(Icons.grid_view),
              ],
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildProjectsDisplay() {
    if (viewMode == 'list') {
      return _buildProjectsList();
    } else {
      return _buildProjectsGrid();
    }
  }

  Widget _buildProjectsList() {
    return ListView.builder(
      itemCount: filteredProjects.length,
      itemBuilder: (context, index) {
        final project = filteredProjects[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            title: Text(project['name']),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${project['startDate']} - ${project['endDate']}'),
                const SizedBox(height: 4),
                LinearProgressIndicator(
                  value: project['progress'] / 100,
                  backgroundColor: Colors.grey[200],
                  color: const Color(0xFFB6C027),
                ),
                Text('${project['progress']}% - ${project['status']}'),
              ],
            ),
            trailing: CircleAvatar(
              backgroundImage: AssetImage(project['members'][0]['image']),
            ),
            onTap: () => _goToProjectDetails(project),
          ),
        );
      },
    );
  }

  Widget _buildProjectsGrid() {
    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.8,
      ),
      itemCount: filteredProjects.length,
      itemBuilder: (context, index) {
        final project = filteredProjects[index];
        return GestureDetector(
          onTap: () => _goToProjectDetails(project),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    project['name'],
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('${project['startDate']} - ${project['endDate']}'),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: project['progress'] / 100,
                    backgroundColor: Colors.grey[200],
                    color: const Color(0xFFB6C027),
                  ),
                  const SizedBox(height: 4),
                  Text('${project['progress']}% - ${project['status']}'),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      for (var i = 0; i < project['members'].length && i < 3; i++)
                        Padding(
                          padding: const EdgeInsets.only(right: 4.0),
                          child: CircleAvatar(
                            radius: 12,
                            backgroundImage: AssetImage(project['members'][i]['image']),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _goToProjectDetails(Map<String, dynamic> project) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProjectDetailsScreen(project: project),
      ),
    );
  }

  void _addProject() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nouveau Projet'),
        content: const Text('Fonctionnalité à implémenter'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}