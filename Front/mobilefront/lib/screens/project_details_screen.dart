import 'package:flutter/material.dart';

class ProjectDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> project;

  const ProjectDetailsScreen({super.key, required this.project});

  @override
  State<ProjectDetailsScreen> createState() => _ProjectDetailsScreenState();
}

class _ProjectDetailsScreenState extends State<ProjectDetailsScreen> {
  String selectedTab = 'details';

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.project['name']),
          bottom: TabBar(
            tabs: const [
              Tab(text: 'Détails'),
              Tab(text: 'Phases'),
            ],
            onTap: (index) {
              setState(() {
                selectedTab = index == 0 ? 'details' : 'phases';
              });
            },
          ),
        ),
        body: TabBarView(
          children: [
            _buildDetailsTab(),
            _buildPhasesTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Détails du projet',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow('Nom', widget.project['name']),
                  _buildDetailRow('Description', widget.project['description'] ?? 'Pas de description'),
                  _buildDetailRow('Date de création', widget.project['createdAt']),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE27D60),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    child: const Text('Modifier'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Text(
                    'Statistiques',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: 100,
                    height: 100,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        CircularProgressIndicator(
                          value: widget.project['progress'] / 100,
                          strokeWidth: 8,
                          color: const Color(0xFFE27D60),
                        ),
                        Text(
                          '${widget.project['progress']}%',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Membres du projet',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (var member in widget.project['members'])
                        Chip(
                          avatar: CircleAvatar(
                            backgroundImage: AssetImage(member['image']),
                          ),
                          label: Text(member['name']),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label :',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
Widget _buildPhasesTab() {
    // Ensure phases is a List<Map<String, dynamic>> and not null
    final List<Map<String, dynamic>> phases = widget.project['phases'] is List 
        ? List<Map<String, dynamic>>.from(widget.project['phases'].map((item) =>  item is Map ? Map<String, dynamic>.from(item) : <String, dynamic>{})): <Map<String, dynamic>>[];

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Phases',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                onPressed: _addPhase,
                icon: const Icon(Icons.add, size: 20),
                label: const Text('Ajouter une phase'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE27D60),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: phases.isEmpty
              ? const Center(child: Text('Aucune phase disponible pour ce projet.'))
              : ListView.builder(
                  itemCount: phases.length,
                  itemBuilder: (context, index) {
                    final phase = phases[index];
                    
                    // Safely get all values with defaults
                    final name = phase['name']?.toString() ?? 'Phase sans nom';
                    final description = phase['description']?.toString() ?? 'Pas de description';
                    final startDate = phase['startDate']?.toString() ?? 'Date inconnue';
                    final endDate = phase['endDate']?.toString() ?? 'Date inconnue';
                    final tasks = phase['tasks'] is List ? phase['tasks'] as List : [];
                    final members = phase['members'] is List 
                        ? List<Map<String, dynamic>>.from(phase['members'].map((m) => 
                            m is Map ? Map<String, dynamic>.from(m) : <String, dynamic>{}))
                        : <Map<String, dynamic>>[];

                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.edit, size: 20),
                                      onPressed: () => _editPhase(phase),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                                      onPressed: () => _deletePhase(phase),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(description),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.calendar_today, size: 16),
                                const SizedBox(width: 4),
                                Text('$startDate - $endDate'),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.checklist, size: 16),
                                const SizedBox(width: 4),
                                Text('${tasks.length} tâches'),
                              ],
                            ),
                            const SizedBox(height: 8),
                            if (members.isNotEmpty)
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Membres:',
                                    style: TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Wrap(
                                    spacing: 8,
                                    children: [
                                      for (final member in members)
                                        Chip(
                                          avatar: CircleAvatar(
                                            backgroundImage: member['image'] != null 
                                                ? AssetImage(member['image'].toString())
                                                : null,
                                            radius: 12,
                                            child: member['image'] == null 
                                                ? Text(member['name']?.toString().isNotEmpty == true 
                                                    ? member['name'].toString().substring(0, 1)
                                                    : '?')
                                                : null,
                                          ),
                                          label: Text(member['name']?.toString() ?? 'Membre'),
                                          backgroundColor: Colors.grey[200],
                                          visualDensity: VisualDensity.compact,
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
   void _addPhase() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nouvelle Phase'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Nom de la phase',
                  border: OutlineInputBorder(),
                ),
                onChanged: (value) {},
              ),
              const SizedBox(height: 16),
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                onChanged: (value) {},
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        labelText: 'Date début',
                        border: OutlineInputBorder(),
                      ),
                      onTap: () async {
                        final date = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2100),
                        );
                        if (date != null) {
                          // Mettre à jour la date
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        labelText: 'Date fin',
                        border: OutlineInputBorder(),
                      ),
                      onTap: () async {
                        final date = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2100),
                        );
                        if (date != null) {
                          // Mettre à jour la date
                        }
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              // Ajouter la nouvelle phase
              setState(() {
                widget.project['phases'].add({
                  'name': 'Nouvelle Phase',
                  'description': 'Description de la nouvelle phase',
                  'startDate': '01/01/2025',
                  'endDate': '31/12/2025',
                  'tasks': [],
                  'members': [],
                });
              });
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE27D60),
            ),
            child: const Text('Ajouter'),
          ),
        ],
      ),
    );
  }

  void _editPhase(Map<String, dynamic> phase) {
    final controller = TextEditingController(text: phase['name']);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Modifier la phase'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Nom de la phase',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                phase['name'] = controller.text;
              });
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE27D60),
            ),
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
  }

  void _deletePhase(Map<String, dynamic> phase) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer la phase'),
        content: Text('Voulez-vous vraiment supprimer "${phase['name']}" ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                widget.project['phases'].remove(phase);
              });
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
  }}